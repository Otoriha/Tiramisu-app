# 画像アセット管理

このディレクトリには、Tiramisuアプリで使用する高品質な画像アセットを格納します。

## ディレクトリ構造

```
/public/images/
├── hero/                    # ヒーローセクション用画像
│   ├── tiramisu-hero-1920.webp    # メイン画像 (1920x1080)
│   ├── tiramisu-hero-1280.webp    # 中解像度 (1280x720)
│   ├── tiramisu-hero-640.webp     # 小解像度 (640x360)
│   └── tiramisu-hero-fallback.jpg # フォールバック画像
├── products/                # 商品紹介用画像
│   ├── classic-tiramisu-600.webp
│   ├── chocolate-tiramisu-600.webp
│   ├── berry-tiramisu-600.webp
│   ├── matcha-tiramisu-600.webp
│   ├── seasonal-tiramisu-600.webp
│   └── premium-tiramisu-600.webp
└── ui/                      # UI装飾用
    ├── patterns/            # 背景パターン
    └── icons/              # カスタムアイコン
```

## 画像要件

### ヒーロー画像
- **サイズ**: 1920x1080px (16:9)
- **フォーマット**: WebP (フォールバック: JPEG)
- **品質**: 高品質、80-90% compression
- **内容**: 美しいティラミスの写真、暗いオーバーレイ対応

### 商品画像
- **サイズ**: 600x400px (3:2)
- **フォーマット**: WebP (フォールバック: JPEG)
- **品質**: 高品質、80% compression
- **内容**: 各種ティラミスバリエーション

## 推奨画像

### ヒーロー用
- 高級感のあるティラミス写真
- 暗い背景またはオーバーレイに対応
- テキストが読みやすい構図

### 商品用
1. **Classic Tiramisu**: 伝統的なティラミス
2. **Chocolate Tiramisu**: チョコレート系バリエーション
3. **Berry Tiramisu**: ベリー系フルーツティラミス
4. **Matcha Tiramisu**: 抹茶ティラミス
5. **Seasonal Tiramisu**: 季節限定デザイン
6. **Premium Tiramisu**: 最高級ティラミス

## 画像最適化

### WebP対応
- メインフォーマットとしてWebPを使用
- サイズは通常JPEGの25-35%削減
- 古いブラウザ向けJPEGフォールバック

### レスポンシブ対応
- 複数解像度の画像を用意
- `srcset`属性で最適な画像を配信
- `sizes`属性でレイアウト幅を指定

### 遅延読み込み
- `loading="lazy"`属性
- Intersection Observer API
- プレースホルダー画像

## 著作権について

- 全ての画像は適切な使用許可を得たもののみ使用
- ストックフォト利用時はライセンス確認
- オリジナル撮影画像を推奨

## 実装例

```tsx
import { OptimizedImage } from '@/components/ui/OptimizedImage'

// ヒーロー画像
<OptimizedImage
  src="/images/hero/tiramisu-hero"
  alt="美しいティラミス"
  width={1920}
  height={1080}
  priority
  className="w-full h-full object-cover"
/>

// 商品画像
<OptimizedImage
  src="/images/products/classic-tiramisu"
  alt="クラシックティラミス"
  width={600}
  height={400}
  loading="lazy"
  className="w-full h-64 object-cover rounded-lg"
/>
```