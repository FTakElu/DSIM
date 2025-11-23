import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';
import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { dynamoDB, TABLES } from '../config/aws';
import { User } from '../types';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Registrar novo usuário
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📝 Iniciando registro de usuário...');
    const { nome, email, senha, role = 'admin' } = req.body;
    console.log('Dados recebidos:', { nome, email, role });

    if (!nome || !email || !senha) {
      res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
      return;
    }

    console.log('✅ Validação OK. Verificando se usuário existe...');
    // Verificar se usuário já existe
    const existingUser = await dynamoDB.send(
      new GetCommand({
        TableName: TABLES.USERS,
        Key: { email },
      })
    );
    console.log('Resultado da busca:', existingUser.Item ? 'Usuário já existe' : 'Usuário novo');

    if (existingUser.Item) {
      res.status(400).json({ message: 'Email já cadastrado' });
      return;
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    const newUser: User = {
      userId: uuidv4(),
      nome,
      email,
      senha: hashedPassword,
      role,
      createdAt: Date.now(),
    };

    await dynamoDB.send(
      new PutCommand({
        TableName: TABLES.USERS,
        Item: newUser,
      })
    );

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso',
      userId: newUser.userId,
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      res.status(400).json({ message: 'Email e senha são obrigatórios' });
      return;
    }

    // Buscar usuário
    const result = await dynamoDB.send(
      new GetCommand({
        TableName: TABLES.USERS,
        Key: { email },
      })
    );

    const user = result.Item as User | undefined;

    if (!user) {
      res.status(401).json({ message: 'Credenciais inválidas' });
      return;
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(senha, user.senha);

    if (!isValidPassword) {
      res.status(401).json({ message: 'Credenciais inválidas' });
      return;
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      role: user.role,
      userId: user.userId,
      nome: user.nome,
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
});

// Atualizar perfil do usuário
router.put('/perfil', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { nome, email, senhaAtual, novaSenha } = req.body;

    if (!nome || !email) {
      res.status(400).json({ message: 'Nome e email são obrigatórios' });
      return;
    }

    // Buscar usuário atual
    const result = await dynamoDB.send(
      new GetCommand({
        TableName: TABLES.USERS,
        Key: { email: req.userEmail }, // Email atual do token
      })
    );

    const user = result.Item as User | undefined;

    if (!user) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    // Se está mudando email, verificar se novo email já existe
    if (email !== req.userEmail) {
      const existingUser = await dynamoDB.send(
        new GetCommand({
          TableName: TABLES.USERS,
          Key: { email },
        })
      );

      if (existingUser.Item) {
        res.status(400).json({ message: 'Email já está em uso' });
        return;
      }
    }

    // Se está mudando senha, validar senha atual
    let hashedNewPassword: string | undefined;
    if (novaSenha) {
      if (!senhaAtual) {
        res.status(400).json({ message: 'Senha atual é obrigatória para alterar a senha' });
        return;
      }

      const isValidPassword = await bcrypt.compare(senhaAtual, user.senha);
      if (!isValidPassword) {
        res.status(401).json({ message: 'Senha atual incorreta' });
        return;
      }

      if (novaSenha.length < 6) {
        res.status(400).json({ message: 'Nova senha deve ter pelo menos 6 caracteres' });
        return;
      }

      hashedNewPassword = await bcrypt.hash(novaSenha, 10);
    }

    // Se email mudou, deletar registro antigo e criar novo (pois email é a chave)
    if (email !== req.userEmail) {
      // Criar novo registro com email atualizado
      const updatedUser: User = {
        ...user,
        nome,
        email,
        senha: hashedNewPassword || user.senha,
        updatedAt: Date.now(),
      };

      await dynamoDB.send(
        new PutCommand({
          TableName: TABLES.USERS,
          Item: updatedUser,
        })
      );

      // TODO: Deletar registro antigo (requer scan ou GSI)
      // Por enquanto, manter ambos registros
    } else {
      // Atualizar registro existente
      const updateExpression: string[] = ['#nome = :nome'];
      const expressionAttributeNames: Record<string, string> = { '#nome': 'nome' };
      const expressionAttributeValues: Record<string, any> = { ':nome': nome };

      if (hashedNewPassword) {
        updateExpression.push('#senha = :senha');
        expressionAttributeNames['#senha'] = 'senha';
        expressionAttributeValues[':senha'] = hashedNewPassword;
      }

      updateExpression.push('#updatedAt = :updatedAt');
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = Date.now();

      await dynamoDB.send(
        new UpdateCommand({
          TableName: TABLES.USERS,
          Key: { email },
          UpdateExpression: `SET ${updateExpression.join(', ')}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
        })
      );
    }

    res.json({
      message: 'Perfil atualizado com sucesso',
      nome,
      email,
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro ao atualizar perfil' });
  }
});

export default router;
