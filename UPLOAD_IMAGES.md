# Upload de Imagens para Logos de Lojas

## Alterações Implementadas

### Backend

1. **Serviço de Upload** (`src/common/upload/upload.service.ts`)
   - Upload de arquivos via multipart/form-data
   - Upload de imagens em base64
   - Validação de tipo de arquivo (JPEG, PNG, GIF, WebP)
   - Validação de tamanho (máx. 5MB)
   - Geração de nomes únicos usando UUID

2. **Endpoints Adicionados** (`src/stores/stores.controller.ts`)
   - `POST /stores/upload-logo` - Upload via multipart/form-data
   - `POST /stores/upload-logo-base64` - Upload via base64

3. **Arquivos Estáticos**
   - Configurado servir arquivos da pasta `/uploads/stores`
   - Arquivos acessíveis via `http://localhost:3000/uploads/stores/[filename]`

4. **Estrutura de Pastas**
   ```
   uploads/
   └── stores/
       ├── uuid-1.jpg
       ├── uuid-2.png
       └── ...
   ```

### Frontend

1. **Componente ImageUpload** (`src/components/upload/ImageUpload.tsx`)
   - Área de drag & drop para upload
   - Preview da imagem selecionada
   - Validação de tipo e tamanho
   - Upload automático ao selecionar arquivo
   - Botão para remover imagem
   - Feedback visual (loading, erros)

2. **Formulário de Loja Atualizado**
   - Substituído campo de URL por componente de upload
   - Upload direto de imagens do dispositivo
   - Preview em tempo real

## Como Usar

### No Formulário de Loja

1. **Criar Nova Loja**:
   - Clique em "+ Nova Loja"
   - No campo "Logo/Ícone da Loja", clique na área de upload ou arraste uma imagem
   - A imagem será automaticamente enviada e o preview aparecerá
   - Continue preenchendo os demais campos
   - Clique em "Criar"

2. **Editar Loja Existente**:
   - Clique em "Editar" na loja desejada
   - A imagem atual será exibida
   - Para trocar, clique no X vermelho para remover e faça upload de uma nova
   - Clique em "Atualizar"

### Tipos de Arquivo Aceitos

- JPEG/JPG
- PNG
- GIF
- WebP

### Restrições

- Tamanho máximo: **5MB**
- Formatos aceitos: imagens apenas

## Estrutura Técnica

### Fluxo de Upload

1. Usuário seleciona imagem no componente
2. Arquivo é convertido para base64
3. Preview é exibido imediatamente
4. Requisição POST enviada para `/stores/upload-logo-base64`
5. Backend salva arquivo e retorna URL
6. URL é armazenada no formulário
7. Ao salvar loja, URL é enviada junto com demais dados

### URLs das Imagens

As imagens são armazenadas localmente e servidas pelo backend:

```
http://localhost:3000/uploads/stores/[uuid].[ext]
```

Exemplo:
```
http://localhost:3000/uploads/stores/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg
```

## Segurança

✅ **Validações Implementadas**:
- Tipo de arquivo (apenas imagens)
- Tamanho máximo (5MB)
- Nomes únicos (UUID) para evitar conflitos
- Autenticação JWT requerida para upload

⚠️ **Considerações de Produção**:
- Em produção, considere usar um serviço de armazenamento em nuvem (AWS S3, Azure Blob, etc.)
- Implemente CDN para melhor performance
- Adicione compressão/otimização de imagens
- Configure backup da pasta uploads

## Desenvolvimento

### Iniciar Backend
```bash
cd localiza-tech-api
npm run start:dev
```

### Iniciar Frontend
```bash
cd front-localiza
npm run dev
```

### Pasta de Uploads

A pasta `uploads/` é criada automaticamente no primeiro upload e está no `.gitignore`.

Para limpar uploads em desenvolvimento:
```bash
rm -rf uploads/stores/*
```

## Troubleshooting

### Imagem não aparece no preview
- Verifique o console do navegador
- Confirme que o arquivo é uma imagem válida
- Verifique se o tamanho está abaixo de 5MB

### Erro ao fazer upload
- Verifique se o backend está rodando
- Confirme que está autenticado (token JWT válido)
- Verifique permissões da pasta uploads

### Imagem não carrega após salvar
- Verifique se o backend está servindo arquivos estáticos corretamente
- Confirme que a URL retornada está correta
- Verifique se a pasta uploads/stores existe
