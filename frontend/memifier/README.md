### **Projeto Memifier - Guia de Desenvolvimento de Frontend**

Bem-vindo ao projeto Memifier! Este guia irá ajudá-lo a configurar o ambiente e compreender a estrutura do projeto, mesmo que nunca tenha trabalhado com Angular antes.

#### **Pré-requisitos**

1. **Instalar o Node.js** na versão 20.11.1
   - Pode descarregar e instalar a versão correta no [site oficial do Node.js](https://nodejs.org/).
2. **Instalar o Android Studio** se pretender gerar o APK.

------

### **Passos Iniciais**

1. **Instalar as dependências do projeto**

   ```bash
   npm install
   ```

2. **Executar o frontend na web**

   ```bash
   npx nx run memifier:serve
   ```

------

### **Gerar o APK (Aplicação Mobile)**

1. **Build do projeto Angular**

   ```bash
   npx nx run memifier:build
   ```

2. **Copiar o build para o Capacitor**

   ```bash
   npx cap copy
   ```

3. **Abrir o projeto no Android Studio**

   ```bash
   npx cap open android
   ```

4. No Android Studio:

   - Clique no ícone do elefante no canto superior direito ("Sync Project with Gradle Files").
   - Ligue um dispositivo Android ou abra um emulador.
   - Clique no botão "Play" para instalar e testar a aplicação no dispositivo.

------

### **Estrutura do Projeto**

- **src/app**:
  - Contém a estrutura principal da aplicação Angular.
  - Aqui, temos os ficheiros:
    - `app.module.ts`: Configurações principais do módulo.
    - `app.component.ts` e `app.component.html`: Componente raiz da aplicação, onde a aplicação inicia.
- **src/app/components**:
  - Todos os componentes criados serão adicionados nesta pasta. Cada componente tem os seus próprios ficheiros `.ts`, `.html` e `.css` que definem a sua lógica, visual e estilo.
- **src/app/services**:
  - Aqui estão os serviços que gerem a lógica de negócio e as interações com APIs ou outros módulos da aplicação.

------

### **Principais Comandos Angular**

Aqui estão alguns comandos essenciais para ajudar no desenvolvimento:

- **Criar um novo componente**:

  ```bash
  cd components && npx nx generate component nome-do-componente
  ```

  Isto cria um novo componente dentro da pasta `components`.

- **Criar um novo serviço**:

  ```bash
  cd services && npx nx generate service nome-do-serviço
  ```

  O serviço será adicionado à pasta `services`.

------

### **Boas Práticas**

- **Manter a organização da estrutura do projeto**: Cada componente deve ficar na pasta `components`, e cada serviço na pasta `services`.
- **Comentar o código**: Facilita o entendimento e a manutenção do projeto por outros desenvolvedores.
- **Seguir os padrões de nomenclatura**: Utilize nomes claros e descritivos para ficheiros, classes e métodos.

Se tiverem dúvidas, sintam-se à vontade para entrar em contacto. Bom trabalho e boas contribuições ao projeto Memifier!