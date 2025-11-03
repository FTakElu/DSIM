# Usa imagem base do Java 17
FROM eclipse-temurin:17-jdk

# Define diretório de trabalho
WORKDIR /app

# Copia arquivos Maven Wrapper
COPY .mvn/ .mvn/
COPY mvnw mvnw.cmd ./

# Torna o mvnw executável
RUN chmod +x mvnw

# Copia o pom.xml e baixa dependências (cache layer)
COPY pom.xml .
RUN ./mvnw dependency:resolve

# Copia o código fonte
COPY src ./src

# Compila e gera o JAR
RUN ./mvnw package -DskipTests

# Expõe a porta da aplicação
EXPOSE 8080

# Executa o aplicativo
ENTRYPOINT ["java", "-jar", "target/dsim-backend-0.0.1-SNAPSHOT.jar"]