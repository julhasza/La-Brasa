document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('auth-form');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const title = document.getElementById('auth-title');
    const eyebrow = document.getElementById('auth-eyebrow');
    const submit = document.getElementById('auth-submit');
    const switchText = document.getElementById('switch-text');
    const switchMode = document.getElementById('switch-mode');
    const toast = document.getElementById('toast');

    let modoCadastro = false;
    let toastTimer;

    function mostrarToast(mensagem) {
        toast.textContent = mensagem;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
    }

    function buscarUsuarios() {
        return JSON.parse(localStorage.getItem('labrasa_usuarios') || '[]');
    }

    function salvarUsuarios(usuarios) {
        localStorage.setItem('labrasa_usuarios', JSON.stringify(usuarios));
    }

    function atualizarModo() {
        document.body.classList.toggle('modo-cadastro', modoCadastro);
        eyebrow.textContent = modoCadastro ? 'Novo acesso' : 'Bem-vindo';
        title.textContent = modoCadastro ? 'Criar cadastro' : 'Entrar na plataforma';
        submit.textContent = modoCadastro ? 'Cadastrar' : 'Entrar';
        switchText.textContent = modoCadastro ? 'Já tem cadastro?' : 'Não tem cadastro?';
        switchMode.textContent = modoCadastro ? 'Entrar' : 'Cadastre-se';
        form.reset();
    }

    function acessarPlataforma(usuario) {
        localStorage.setItem('labrasa_usuario_logado', JSON.stringify({
            nome: usuario.nome,
            email: usuario.email
        }));
        window.location.href = 'home.html';
    }

    switchMode.addEventListener('click', () => {
        modoCadastro = !modoCadastro;
        atualizarModo();
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const nome = nomeInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const senha = senhaInput.value.trim();
        const usuarios = buscarUsuarios();

        if (modoCadastro) {
            if (!nome) return mostrarToast('Informe seu nome.');
            if (usuarios.some((usuario) => usuario.email === email)) {
                return mostrarToast('Este e-mail já está cadastrado.');
            }

            const novoUsuario = { nome, email, senha };
            usuarios.push(novoUsuario);
            salvarUsuarios(usuarios);
            mostrarToast('Cadastro criado com sucesso.');
            setTimeout(() => acessarPlataforma(novoUsuario), 700);
            return;
        }

        const usuario = usuarios.find((item) => item.email === email && item.senha === senha);
        if (!usuario) {
            mostrarToast('E-mail ou senha inválidos. Cadastre-se se ainda não tiver conta.');
            return;
        }

        acessarPlataforma(usuario);
    });

    atualizarModo();
});
