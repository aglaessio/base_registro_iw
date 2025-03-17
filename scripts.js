const GITHUB_TOKEN = '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'; // Seu token do GitHub
const REPO_OWNER = 'aglaessio'; // Substitua pelo seu usuário do GitHub
const REPO_NAME = 'base_registro_iw'; // Substitua pelo nome do repositório
const UPLOAD_FOLDER = 'uploads'; // Pasta onde os arquivos serão armazenados

// Função para fazer upload de pastas
async function uploadFolder() {
    const folderInput = document.getElementById('folderInput');
    const files = folderInput.files;

    if (files.length > 0) {
        for (const file of files) {
            const filePath = `${UPLOAD_FOLDER}/${file.webkitRelativePath}`;

            // Lê o conteúdo do arquivo como Base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const fileContent = reader.result.split(',')[1]; // Remove o prefixo "data:..."

                const response = await fetch(
                    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Authorization': `token ${GITHUB_TOKEN}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            message: `Adicionando ${file.name}`,
                            content: fileContent // Conteúdo em Base64
                        })
                    }
                );

                if (response.ok) {
                    console.log(`Arquivo enviado com sucesso: ${file.name}`);
                } else {
                    console.error(`Erro ao enviar arquivo: ${file.name}`, await response.json());
                }
            };
        }
        alert('Upload de pasta concluído!');
        listFiles(); // Atualiza a lista de arquivos
    } else {
        alert('Selecione uma pasta antes de enviar.');
    }
}

// Função para listar arquivos
async function listFiles() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';

    const response = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${UPLOAD_FOLDER}`,
        {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        }
    );

    if (response.ok) {
        const files = await response.json();
        files.forEach((file) => {
            const li = document.createElement('li');
            li.textContent = file.name;
            fileList.appendChild(li);
        });
    } else {
        console.error('Erro ao listar arquivos:', await response.json());
    }
}

// Função para excluir arquivos (protegida por senha)
async function deleteFolder() {
    const passwordInput = document.getElementById('passwordInput');
    const password = passwordInput.value;

    // Senha correta
    const correctPassword = 'Maria.191290';

    if (password === correctPassword) {
        const response = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${UPLOAD_FOLDER}`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`
                }
            }
        );

        if (response.ok) {
            const files = await response.json();
            for (const file of files) {
                await fetch(
                    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${file.path}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `token ${GITHUB_TOKEN}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            message: `Excluindo ${file.name}`,
                            sha: file.sha
                        })
                    }
                );
                console.log(`Arquivo excluído: ${file.name}`);
            }
            alert('Todas as pastas e arquivos foram excluídos!');
            listFiles(); // Atualiza a lista
        } else {
            console.error('Erro ao listar arquivos:', await response.json());
        }
    } else {
        alert('Senha incorreta. Acesso negado.');
    }
}

// Lista os arquivos ao carregar a página
listFiles();
