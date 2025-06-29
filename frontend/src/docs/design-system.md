# Luxury Tiramisu Design System

高級ティラミス専門店のブランドイメージに合わせた、洗練されたデザインシステムです。

## カラーパレット

### Brand Colors

#### Luxury Cream Series
上品で暖かみのあるクリーム色の階調
- `luxury-cream-50`: #FEFCF8 - 最も薄いクリーム
- `luxury-cream-100`: #FDF9F1 - 背景色として最適
- `luxury-cream-200`: #F9F0E2 - セクション区切り
- `luxury-cream-300`: #F5F1E8 - 基本背景色
- `luxury-cream-400`: #E8DDD4 - ボーダー色
- `luxury-cream-500`: #D4C2A8 - アクセント
- `luxury-cream-600`: #C4A882 - 中間色調
- `luxury-cream-700`: #A8905F - 強調色
- `luxury-cream-800`: #8A7248 - ダーク
- `luxury-cream-900`: #6B5B37 - 最も濃い

#### Luxury Gold Series
高級感を演出するゴールド系
- `luxury-gold-50`: #FEF7E0 - ハイライト
- `luxury-gold-100`: #FDECC2 - 背景アクセント
- `luxury-gold-200`: #FAD785 - 装飾
- `luxury-gold-300`: #F7C142 - アクセント
- `luxury-gold-400`: #F0A90A - 警告色
- `luxury-gold-500`: #B8860B - メインゴールド
- `luxury-gold-600`: #996F0A - 濃いゴールド
- `luxury-gold-700`: #7A5808 - ダークゴールド
- `luxury-gold-800`: #5C4206 - 非常に濃い
- `luxury-gold-900`: #3E2C04 - 最も濃い

#### Luxury Brown Series
ティラミスらしいブラウン系
- `luxury-brown-50`: #F7F3F0 - 薄いベージュ
- `luxury-brown-100`: #E8DDD6 - 背景色
- `luxury-brown-200`: #D1BAA8 - 淡いブラウン
- `luxury-brown-300`: #B8967A - 中間色
- `luxury-brown-400`: #9F734C - アクセント
- `luxury-brown-500`: #8B4513 - メインブラウン
- `luxury-brown-600`: #73370F - 濃いブラウン
- `luxury-brown-700`: #5B2A0C - テキスト用
- `luxury-brown-800`: #431F09 - 見出し用
- `luxury-brown-900`: #2F1B14 - 最も濃いテキスト

#### Luxury Warm Series
暖かみのあるオレンジ系アクセント
- `luxury-warm-50`: #FDF6F0 - 薄いオレンジ
- `luxury-warm-100`: #FAEAE0 - 背景アクセント
- `luxury-warm-200`: #F4D5C1 - 淡いオレンジ
- `luxury-warm-300`: #EDB896 - 中間色
- `luxury-warm-400`: #E69B6B - アクセント
- `luxury-warm-500`: #D2691E - メインオレンジ
- `luxury-warm-600`: #B8571A - 濃いオレンジ
- `luxury-warm-700`: #9F4515 - ダークオレンジ
- `luxury-warm-800`: #7D3410 - 非常に濃い
- `luxury-warm-900`: #5A240B - 最も濃い

## タイポグラフィ

### 見出し階層

#### Luxury Heading 1 (.luxury-heading-1)
- Font Size: 3rem (48px)
- Line Height: 1.25
- Font Weight: 700
- Color: luxury-brown-900
- Letter Spacing: -0.025em
- 用途: ページタイトル、メインヒーロー

#### Luxury Heading 2 (.luxury-heading-2)
- Font Size: 2.25rem (36px)
- Line Height: 1.25
- Font Weight: 600
- Color: luxury-brown-900
- Letter Spacing: -0.025em
- 用途: セクションタイトル

#### Luxury Heading 3 (.luxury-heading-3)
- Font Size: 1.875rem (30px)
- Line Height: 1.375
- Font Weight: 600
- Color: luxury-brown-800
- 用途: サブセクションタイトル

#### Luxury Heading 4 (.luxury-heading-4)
- Font Size: 1.5rem (24px)
- Line Height: 1.375
- Font Weight: 600
- Color: luxury-brown-800
- 用途: カードタイトル、小見出し

### 本文テキスト

#### Large Body (.luxury-body-large)
- Font Size: 1.125rem (18px)
- Line Height: 1.625
- Color: luxury-brown-700
- 用途: 重要な説明文、リード文

#### Body (.luxury-body)
- Font Size: 1rem (16px)
- Line Height: 1.5
- Color: luxury-brown-700
- 用途: 標準的な本文

#### Small Body (.luxury-body-small)
- Font Size: 0.875rem (14px)
- Line Height: 1.5
- Color: luxury-brown-600
- 用途: 補足情報、ラベル

#### Caption (.luxury-caption)
- Font Size: 0.75rem (12px)
- Line Height: 1.5
- Color: luxury-brown-500
- 用途: キャプション、注釈

## コンポーネント

### Button

#### バリエーション

**default**: 標準的なプライマリボタン
- Background: luxury-warm-500
- Hover: luxury-warm-600
- Text: white
- Shadow: medium → large

**luxury**: 高級感のあるゴールドグラデーション
- Background: gradient (luxury-gold-500 → luxury-gold-600)
- Hover: gradient (luxury-gold-600 → luxury-gold-700)
- Text: white
- Border: luxury-gold-400
- Shadow: large → extra large

**secondary**: セカンダリボタン
- Background: luxury-cream-200
- Hover: luxury-cream-300
- Text: luxury-brown-800
- Shadow: small → medium

**outline**: アウトラインボタン
- Border: luxury-brown-300 → luxury-brown-500
- Text: luxury-brown-700 → luxury-brown-900
- Hover Background: luxury-cream-100

**ghost**: ゴーストボタン
- Text: luxury-brown-700 → luxury-brown-900
- Hover Background: luxury-cream-100

#### サイズ
- **sm**: h-8, px-3, py-1.5, text-sm
- **default**: h-10, px-4, py-2, text-base
- **lg**: h-12, px-6, py-3, text-lg
- **xl**: h-14, px-8, py-4, text-xl

### Card

#### バリエーション

**default**: 標準的なカード
- Background: white
- Border: luxury-cream-300
- Shadow: medium → large

**luxury**: 高級感のあるカード
- Background: gradient (luxury-cream-50 → luxury-cream-100)
- Border: luxury-cream-400
- Shadow: luxury shadow → extra large

**elevated**: 浮き上がったカード
- Background: white
- Border: luxury-cream-200
- Shadow: large → extra large

**outlined**: アウトラインカード
- Background: transparent
- Border: luxury-brown-300 → luxury-brown-500
- Hover Background: luxury-cream-50

### Input

#### バリエーション

**default**: 標準的な入力フィールド
- Height: 3rem (48px)
- Border: luxury-cream-300
- Focus: luxury-warm-500
- Background: white

**luxury**: 高級感のある入力フィールド
- Height: 3.5rem (56px)
- Border: luxury-gold-300 → luxury-gold-500
- Background: gradient (luxury-cream-50 → white)
- Shadow: small → medium

**outline**: アウトライン入力フィールド
- Border: luxury-brown-300 → luxury-brown-600
- Background: transparent

## スペーシング

### CSS Variables
```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
--spacing-3xl: 4rem;     /* 64px */
--spacing-4xl: 6rem;     /* 96px */
--spacing-5xl: 8rem;     /* 128px */
```

## シャドウ

### 階層別シャドウ
- **sm**: 軽いシャドウ - カード、ボタン等
- **md**: 標準シャドウ - 浮き上がり効果
- **lg**: 強いシャドウ - モーダル、ドロップダウン
- **xl**: 非常に強いシャドウ - ヒーロー要素
- **luxury**: ブランド専用シャドウ - 特別な要素

## アニメーション

### トランジション
- **fast**: 0.15s ease-in-out - ホバー効果
- **normal**: 0.3s ease-in-out - 標準的な変化
- **slow**: 0.5s ease-in-out - 大きな変化

### エフェクト
- **luxury-hover-lift**: ホバー時の浮き上がり効果
- **luxury-animate-fade-in**: フェードイン
- **luxury-animate-slide-up**: スライドアップ

## 使用例

### 基本的なカード
```tsx
<Card variant="luxury" className="p-6">
  <CardTitle>クラシックティラミス</CardTitle>
  <CardDescription>
    伝統的なイタリアンレシピで作られた、
    本格的なティラミスです。
  </CardDescription>
  <Button variant="luxury" size="lg">
    詳細を見る
  </Button>
</Card>
```

### フォーム
```tsx
<div className="space-y-4">
  <Input 
    variant="luxury" 
    placeholder="お名前を入力してください" 
  />
  <Button variant="default" size="lg" className="w-full">
    送信する
  </Button>
</div>
```

## レスポンシブデザイン

### ブレークポイント
- **sm**: 640px以上
- **md**: 768px以上
- **lg**: 1024px以上
- **xl**: 1280px以上

### モバイル対応
- 見出しサイズの自動調整
- タッチフレンドリーなボタンサイズ
- 適切なスペーシングの確保

このデザインシステムにより、高級ティラミス専門店に相応しい、統一された美しいユーザーインターフェースを実現できます。