const REPO_OWNER = 'aglaessio'; // Substitua pelo seu usuário do GitHub
const REPO_NAME = 'base_registro_iw'; // Substitua pelo nome do repositório

// Obtém o token de ambiente (substitua essa lógica pelo seu backend seguro)
async function getToken() {
    return localStorage.getItem('GITHUB_TOKEN'); // Use um método seguro!
}

// Função para listar arquivos
async function listFiles() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    const token = await getToken();

    if (!token) {
        alert('Erro: Token do GitHub não encontrado.');
        return;
    }

    try {
        const response = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/`,
            {
                headers: { 'Authorization': `token ${token}` }
            }
        );
        
        if (!response.ok) throw new Error('Erro ao buscar arquivos.');
        
        const files = await response.json();
        if (Array.isArray(files)) {
            files.forEach(file => {
                const li = document.createElement('li');
                const link = document.createElement('a');
                link.href = file.download_url;
                link.textContent = file.name;
                link.target = '_blank';
                li.appendChild(link);
                fileList.appendChild(li);
            });
        }
    } catch (error) {
        console.error(error);
        alert('Erro ao listar arquivos.');
    }
}

// Função para upload de arquivos
async function uploadFolder() {
    const folderInput = document.getElementById('folderInput');
    const files = folderInput.files;
    const token = await getToken();
    
    if (!token) {
        alert('Erro: Token do GitHub não encontrado.');
        return;
    }
    
    if (files.length > 0) {
        for (const file of files) {
            const filePath = file.webkitRelativePath || file.name;
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const fileContent = reader.result.split(',')[1];
                try {
                    const response = await fetch(
                        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
                        {
                            method: 'PUT',
                            headers: {
                                'Authorization': `token ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                message: `Adicionando ${file.name}`,
                                content: fileContent
                            })
                        }
                    );
                    if (!response.ok) throw new Error(`Erro no upload: ${file.name}`);
                } catch (error) {
                    console.error(error);
                }
            };
        }
        alert('Upload de pasta concluído!');
        listFiles();
    } else {
        alert('Selecione uma pasta antes de enviar.');
    }
}

// Função para exclusão de arquivos
async function requestPasswordAndDelete() {
    const password = prompt('Digite a senha para excluir os arquivos:');
    if (password !== 'suaSenhaSegura') { // Substituir por autenticação segura
        alert('Senha incorreta. Acesso negado.');
        return;
    }
    const token = await getToken();
    
    if (!token) {
        alert('Erro: Token do GitHub não encontrado.');
        return;
    }

    try {
        const response = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/`,
            { headers: { 'Authorization': `token ${token}` } }
        );

        if (!response.ok) throw new Error('Erro ao buscar arquivos para excluir.');
        
        const files = await response.json();
        for (const file of files) {
            await fetch(
                `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${file.path}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Excluindo ${file.name}`,
                        sha: file.sha
                    })
                }
            );
        }
        alert('Arquivos excluídos com sucesso!');
        listFiles();
    } catch (error) {
        console.error(error);
        alert('Erro ao excluir arquivos.');
    }
}

// Carregar lista ao iniciar
listFiles();
