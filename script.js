const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Função para alternar para o formulário de registro
function switchToRegister() {
    loginForm.classList.remove('active');
    registerForm.classList.add('active');
}

// Função para alternar para o formulário de login
function switchToLogin() {
    registerForm.classList.remove('active');
    loginForm.classList.add('active');
}

// Função para mostrar recuperação de senha
function showForgotPassword() {
    alert('Funcionalidade de recuperação de senha será implementada em breve!');
}

// Validação e envio do formulário de login
loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    // Simulação de login
    console.log('Tentativa de login:', { email, password });
    alert('Login realizado com sucesso! Redirecionando...');

});

// Validação e envio do formulário de registro
registerForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validações
    if (!name || !email || !password || !confirmPassword) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }

    if (password !== confirmPassword) {
        showToast(
            'Erro na confirmação de senha',
            'As senhas digitadas não coincidem. Verifique e tente novamente.',
            '⚠️',
            'warning'
        );
        return;
    }

    if (password.length < 6) {
        showToast(
            'Senha muito curta',
            'A senha deve ter pelo menos 6 caracteres para sua segurança.',
            '🔒',
            'error'
        );
        return;
    }

        // Função para mostrar toast ao se registrar
        function showToast(title, message, icon = '✅', type = 'success') {
            // Remove toast existente se houver
            const existingToast = document.querySelector('.toast');
            if (existingToast) {
                existingToast.remove();
            }

            // Criar o elemento toast
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `
                <div class="toast-icon">${icon}</div>
                <div class="toast-content">
                    <div class="toast-title">${title}</div>
                    <div class="toast-message">${message}</div>
                </div>
                <button class="toast-close" onclick="hideToast(this)">&times;</button>
                <div class="toast-progress"></div>
            `;

            // Adicionar ao body
            document.body.appendChild(toast);

            // Mostrar o toast com animação
            setTimeout(() => {
                toast.classList.add('show');
            }, 100);

            // Auto-remover após 4 segundos
            setTimeout(() => {
                hideToast(toast);
            }, 4000);
        }

        // Função para esconder toast
        function hideToast(toastElement) {
            const toast = toastElement.classList ? toastElement : toastElement.parentElement.parentElement;
            toast.classList.add('hide');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 400);
        }
        // Mostrar toast de sucesso
        showToast(
            'Conta criada com sucesso!',
            `Bem-vindo ao SoundWave, ${name}! Agora você pode fazer login.`,
            '🎉'
        );

            // Limpar formulário e voltar para login após um pequeno delay
            setTimeout(() => {
                registerForm.reset();
                switchToLogin();
            }, 1500);

        // Limpar formulário e voltar para login
        registerForm.reset();
        switchToLogin();

    });

// Validação em tempo real para confirmação de senha
document.getElementById('confirmPassword').addEventListener('input', function () {
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = this.value;

    if (password && confirmPassword && password !== confirmPassword) {
        this.style.borderColor = '#ff4757';
    } else {
        this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    }
});

// Adicionar efeito visual nos inputs
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function () {
        this.parentElement.style.transform = 'scale(1.02)';
    });

    input.addEventListener('blur', function () {
        this.parentElement.style.transform = 'scale(1)';
    });
});