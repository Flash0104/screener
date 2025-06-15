# 🎵 Screener Chrome Extension - System Audio Setup

## 📦 Extension Kurulumu

### 1. Extension Dosyalarını Hazırla
```bash
# Extension için gerekli dosyalar zaten oluşturuldu:
# - public/manifest.json
# - public/background.js
# - public/content.js
```

### 2. Chrome Extension Yükle

1. **Chrome'da**: `chrome://extensions/` git
2. **Developer mode**'u aç (sağ üst)
3. **"Load unpacked"** tıkla
4. **`public` klasörünü** seç
5. **Screener extension** yüklendi! ✅

### 3. Test Et

1. **http://localhost:3000** git
2. **Settings** → **Include Audio** ✅
3. **Start Recording** bas
4. **Extension popup** gelecek → **Share** seç
5. **System audio + video** kaydedilecek! 🎵

## ✨ Extension Avantajları

- ✅ **System audio capture** (Spotify, YouTube, sistem sesleri)
- ✅ **No browser limitations**  
- ✅ **Professional quality**
- ✅ **Mevcut Screener UI**'yi kullanır

## 🚀 Production Deploy

Extension'ı Chrome Web Store'a yükleyebiliriz:

1. **Icon'lar ekle** (16x16, 48x48, 128x128)
2. **Chrome Web Store** account
3. **$5 developer fee**
4. **Review process** (1-3 gün)

## 📱 Alternatif: Electron App

Daha da güçlü için desktop app yapabiliriz:

```bash
npm install electron electron-builder
```

**Hangisini tercih edersin?**
- 🎯 **Chrome Extension** (hızlı, kolay)
- 🖥️ **Electron App** (tam control) 