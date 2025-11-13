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

export default router;
