import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../service/api';
import theme from '../styles/Theme.module.css';
import styles from './PerfilUsuarioPage.module.css';

export default function PerfilUsuarioPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });

  useEffect(() => {
    const userName = localStorage.getItem('userName') || '';
    const userEmail = localStorage.getItem('userEmail') || '';
    setFormData(prev => ({ ...prev, nome: userName, email: userEmail }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validações
    if (formData.novaSenha && formData.novaSenha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (formData.novaSenha && formData.novaSenha.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const updateData: any = {
        nome: formData.nome,
        email: formData.email
      };

      if (formData.novaSenha) {
        updateData.senhaAtual = formData.senhaAtual;
        updateData.novaSenha = formData.novaSenha;
      }

      await api.put('/api/auth/perfil', updateData);
      
      // Atualizar localStorage
      localStorage.setItem('userName', formData.nome);
      localStorage.setItem('userEmail', formData.email);
      
      setMessage('Perfil atualizado com sucesso!');
      
      // Limpar campos de senha
      setFormData(prev => ({
        ...prev,
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
      }));

      setTimeout(() => {
        navigate('/pacientes');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirmPassword) {
      setError('Digite sua senha para confirmar a exclusão');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.delete('/api/auth/conta', {
        data: { senha: deleteConfirmPassword }
      });
      
      // Limpar dados locais
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      
      alert('Conta excluída com sucesso!');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao excluir conta');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setDeleteConfirmPassword('');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link to="/pacientes" className={`${theme.btn} ${theme.backButton}`}>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Voltar
          </Link>
          <h1 className={styles.title}>Meu Perfil</h1>
        </div>

        {message && <div className={styles.success}>{message}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Informações Pessoais</h2>
            
            <div className={styles.formGroup}>
              <label htmlFor="nome">Nome Completo *</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Seu nome completo"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Alterar Senha</h2>
            <p className={styles.sectionDescription}>
              Deixe em branco se não deseja alterar a senha
            </p>

            <div className={styles.formGroup}>
              <label htmlFor="senhaAtual">Senha Atual</label>
              <input
                type="password"
                id="senhaAtual"
                name="senhaAtual"
                value={formData.senhaAtual}
                onChange={handleChange}
                placeholder="Digite sua senha atual"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="novaSenha">Nova Senha</label>
              <input
                type="password"
                id="novaSenha"
                name="novaSenha"
                value={formData.novaSenha}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmarSenha">Confirmar Nova Senha</label>
              <input
                type="password"
                id="confirmarSenha"
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                placeholder="Digite a senha novamente"
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button 
              type="button" 
              onClick={() => navigate('/pacientes')}
              className={`${theme.btn} ${theme.ghost}`}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={`${theme.btn} ${theme.primary}`}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>

        {/* Seção de Zona de Perigo */}
        <div className={styles.dangerZone}>
          <h2 className={styles.dangerTitle}>Zona de Perigo</h2>
          <p className={styles.dangerDescription}>
            A exclusão da conta é permanente e não pode ser desfeita. Todos os seus pacientes e dados serão excluídos.
          </p>
          <button 
            type="button" 
            onClick={() => setShowDeleteModal(true)}
            className={`${theme.btn} ${theme.danger}`}
          >
            Excluir Conta
          </button>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Confirmar Exclusão de Conta</h2>
            <p>Esta ação é irreversível. Todos os seus dados e pacientes cadastrados serão excluídos permanentemente.</p>
            
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Digite sua senha para confirmar:</label>
              <input
                type="password"
                id="confirmPassword"
                value={deleteConfirmPassword}
                onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                placeholder="Sua senha"
                autoFocus
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.modalActions}>
              <button 
                type="button" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmPassword('');
                  setError('');
                }}
                className={`${theme.btn} ${theme.ghost}`}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={handleDeleteAccount}
                className={`${theme.btn} ${theme.danger}`}
                disabled={loading}
              >
                {loading ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
