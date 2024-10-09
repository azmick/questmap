# Node.js'in uygun versiyonunu taban imaj olarak seç
FROM node:14

# Konteyner içindeki çalışma dizinini oluştur
WORKDIR /app

# package.json ve package-lock.json dosyalarını çalışma dizinine kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Uygulama kodunu konteynere kopyala
COPY . .

# Uygulamanın dinleyeceği portu aç
EXPOSE 5000

# Ortam değişkenini ayarla (production olarak)
ENV NODE_ENV=production

# Uygulamayı başlat
CMD ["npm", "start"]
