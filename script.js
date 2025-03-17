const GITHUB_TOKEN = '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'; // Remova isso e use variáveis de ambiente
const REPO_OWNER = 'aglaessio'; // Substitua pelo seu usuário do GitHub
const REPO_NAME = 'base_registro_iw'; // Substitua pelo nome do repositório

// Função para listar arquivos
async function listFiles() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = ''; // Limpa a lista antes de atualizar

    try {
        const response = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`
                }
            }
        );

        if (response.ok) {
            const files = await response.json();

            // Verifica se a resposta é um array
            if (Array.isArray(files)) {
                files.forEach((file) => {
                    const li = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = file.download_url; // Link para baixar o arquivo
                    link.textContent = file.name;
                    link.target = '_blank'; // Abre o link em uma nova aba
                    li.appendChild(link);
                    fileList.appendChild(li);
                });
            } else {
                console.error('Resposta inesperada da API:', files);
                alert('Erro ao listar arquivos: Resposta inesperada da API. Verifique o console para mais detalhes.');
            }
        } else {
            const error = await response.json();
            console.error('Erro ao listar arquivos:', error);
            alert('Erro ao listar arquivos. Verifique o console para mais detalhes.');
        }
    } catch (error) {
        console.error('Erro ao listar arquivos:', error);
        alert('Erro ao listar arquivos. Verifique o console para mais detalhes.');
    }
}

// Função para fazer upload de pastas
async function uploadFolder() {
    const folderInput = document.getElementById('folderInput');
    const files = folderInput.files;

    if (files.length > 0) {
        for (const file of files) {
            const filePath = file.webkitRelativePath || file.name; // Usa o caminho relativo ou o nome do arquivo

            // Lê o conteúdo do arquivo como Base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const fileContent = reader.result.split(',')[1]; // Remove o prefixo "data:..."

                try {
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
                        const error = await response.json();
                        console.error(`Erro ao enviar arquivo: ${file.name}`, error);
                        alert(`Erro ao enviar arquivo: ${file.name}. Verifique o console para mais detalhes.`);
                    }
                } catch (error) {
                    console.error(`Erro ao enviar arquivo: ${file.name}`, error);
                    alert(`Erro ao enviar arquivo: ${file.name}. Verifique o console para mais detalhes.`);
                }
            };
        }
        alert('Upload de pasta concluído!');
        listFiles(); // Atualiza a lista de arquivos após o upload
    } else {
        alert('Selecione uma pasta antes de enviar.');
    }
}

// Função para excluir arquivos (protegida por senha)
async function deleteFiles() {
    const passwordInput = document.getElementById('passwordInput');
    const password = passwordInput.value;

    // Senha correta
    const correctPassword = 'Maria.191290';

    if (password === correctPassword) {
        if (confirm('Tem certeza que deseja excluir todos os arquivos? Esta ação não pode ser desfeita.')) {
            const response = await fetch(
                `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/`,
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
                alert('Todos os arquivos foram excluídos!');
                listFiles(); // Atualiza a lista
            } else {
                console.error('Erro ao listar arquivos:', await response.json());
                alert('Erro ao listar arquivos. Verifique o console para mais detalhes.');
            }
        }
    } else {
        alert('Senha incorreta. Acesso negado.');
    }
}

// Lista os arquivos ao carregar a página
listFiles();
