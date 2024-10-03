### **Projeto Memifier - Guia de Desenvolvimento de Backend**

No servidor remoto o projeto está localizado em "cd ~/flask_api"

Para fazer deploy é só correr "sh deploy.sh" na pasta do projeto.
(Nota: É necessária a password do servidor para isso)


Para fazer debug de erros no servidor de produção:
ssh root@157.173.122.221
// colocar a password
cd ~/flask_api
source venv/bin/activate
pkill -f gunicorn
gunicorn --bind 0.0.0.0:5000 flask_api:app &

gunicorn --bind 0.0.0.0:5000 -w 1 flask_api:app &
