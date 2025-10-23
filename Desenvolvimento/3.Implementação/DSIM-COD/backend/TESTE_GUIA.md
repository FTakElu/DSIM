# 🧪 Guia de Teste - DSIM Backend

## 📋 Opções para testar o projeto

### 🐳 **Opção 1: Teste com Docker (Mais Fácil)**

#### 1. Abrir terminal na pasta backend
```bash
cd "c:\Users\flavi\OneDrive\Área de Trabalho\DSIM\Desenvolvimento\3.Implementação\backend"
```

#### 2. Verificar se Docker está rodando
```bash
docker --version
docker-compose --version
```

#### 3. Iniciar o projeto
```bash
docker-compose up --build
```

**Se der erro**, tente:
```bash
docker-compose down
docker-compose up --build --force-recreate
```

#### 4. Em outro terminal, configurar DynamoDB
```bash
setup-dynamodb.bat
```

---

### ⚙️ **Opção 2: Teste Local (Sem Docker)**

#### 1. Verificar Java
```bash
java -version
```
**Deve mostrar Java 17 ou superior**

#### 2. Testar Maven Wrapper
```bash
cd "c:\Users\flavi\OneDrive\Área de Trabalho\DSIM\Desenvolvimento\3.Implementação\backend"
mvnw.cmd --version
```

#### 3. Compilar o projeto
```bash
mvnw.cmd clean compile
```

#### 4. Executar testes
```bash
mvnw.cmd test
```

#### 5. Executar aplicação
```bash
mvnw.cmd spring-boot:run
```

---

### 🔧 **Opção 3: Teste Básico de Compilação**

Se as outras opções não funcionarem:

#### 1. Verificar estrutura
```bash
dir src\main\java\com\example\dsim
```

#### 2. Compilar sem executar
```bash
mvnw.cmd compile
```

#### 3. Gerar JAR
```bash
mvnw.cmd package -DskipTests
```

---

## 🚨 **Possíveis Problemas e Soluções**

### ❌ **Erro: Java não encontrado**
```bash
# Instalar Java 17
# Baixar de: https://adoptium.net/
```

### ❌ **Erro: Docker não funciona**
```bash
# Instalar Docker Desktop
# Baixar de: https://www.docker.com/products/docker-desktop
```

### ❌ **Erro: Porta em uso**
```bash
# Matar processo na porta 8080
netstat -ano | findstr :8080
taskkill /PID [PID_NUMBER] /F
```

### ❌ **Erro de compilação Java**
```bash
# Limpar e recompilar
mvnw.cmd clean
mvnw.cmd compile
```

---

## 🧪 **Testes Rápidos**

### 1. **Teste de Compilação**
```bash
mvnw.cmd clean compile
```
**✅ Sucesso se não mostrar erros**

### 2. **Teste de Empacotamento**
```bash
mvnw.cmd package -DskipTests
```
**✅ Sucesso se criar `target/dsim-backend-0.0.1-SNAPSHOT.jar`**

### 3. **Teste de Execução (se compilou)**
```bash
mvnw.cmd spring-boot:run
```
**✅ Sucesso se mostrar "Started DsimApplication"**

### 4. **Teste da API (se rodando)**
```bash
curl http://localhost:8080/api/v1/pacientes/device/device123
```
**✅ Sucesso se responder JSON ou erro 404**

---

## 📱 **Comandos por Etapa**

### **Etapa 1: Navegação**
```bash
cd "c:\Users\flavi\OneDrive\Área de Trabalho\DSIM\Desenvolvimento\3.Implementação\backend"
```

### **Etapa 2: Verificação**
```bash
dir
```
**Deve mostrar:** `pom.xml`, `src`, `mvnw.cmd`, etc.

### **Etapa 3: Teste básico**
```bash
mvnw.cmd --version
```

### **Etapa 4: Compilação**
```bash
mvnw.cmd clean compile
```

### **Etapa 5: Execução**
```bash
mvnw.cmd spring-boot:run
```

---

## 🆘 **Se nada funcionar**

1. **Verifique se está na pasta correta:**
   ```bash
   cd "c:\Users\flavi\OneDrive\Área de Trabalho\DSIM\Desenvolvimento\3.Implementação\backend"
   dir
   ```

2. **Execute o script automático:**
   ```bash
   start.bat
   ```

3. **Tente compilação mínima:**
   ```bash
   mvnw.cmd clean
   mvnw.cmd validate
   ```

---

## 📞 **Me envie a saída destes comandos:**

1. `java -version`
2. `mvnw.cmd --version`  
3. `mvnw.cmd clean compile`

Assim posso te ajudar com o erro específico! 🤝