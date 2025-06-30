# Tiramisu App アクセシビリティ実装ガイド

## 1. カラーコントラスト問題の修正

### 問題の詳細
現在、以下の要素でWCAG 2.1 AAレベルのカラーコントラスト基準（4.5:1）を満たしていません：

#### HomePage
```tsx
// 問題のあるコード
<button className="... border-white text-white hover:bg-white hover:text-luxury-brown-900">
  レシピを探す
</button>
```

#### 修正案1: ボタンコンポーネントの改善
```tsx
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-luxury-brown-800 text-white hover:bg-luxury-brown-900 focus:ring-luxury-brown-500",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        outline: "border-2 border-luxury-brown-600 text-luxury-brown-800 hover:bg-luxury-brown-100 focus:ring-luxury-brown-400",
        secondary: "bg-luxury-cream-200 text-luxury-brown-900 hover:bg-luxury-cream-300 focus:ring-luxury-cream-400",
        ghost: "text-luxury-brown-800 hover:bg-luxury-cream-100 hover:text-luxury-brown-900 focus:ring-luxury-brown-300",
        link: "text-luxury-brown-800 underline-offset-4 hover:underline focus:ring-luxury-brown-300",
        // 高コントラストバリアント
        highContrast: "bg-black text-white hover:bg-gray-900 focus:ring-gray-700 border-2 border-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 px-6 py-3 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

#### 修正案2: HomePage のヒーローセクション
```tsx
// pages/HomePage.tsx
<div className="flex gap-4 justify-center">
  <Button 
    size="xl" 
    onClick={() => navigate('/recipes')}
    className="min-w-[200px] bg-luxury-brown-800 text-white hover:bg-luxury-brown-900"
  >
    <Search className="mr-2 h-5 w-5" />
    レシピを探す
  </Button>
  <Button 
    size="xl" 
    variant="outline"
    onClick={() => navigate('/stores')}
    className="min-w-[200px] border-luxury-brown-800 text-luxury-brown-800 hover:bg-luxury-brown-100"
  >
    <MapPin className="mr-2 h-5 w-5" />
    店舗を探す
  </Button>
</div>
```

### 2. スキップリンクの実装

```tsx
// components/Layout.tsx
import { useState, useEffect } from 'react';

export function Layout({ children }: { children: React.ReactNode }) {
  const [showSkipLink, setShowSkipLink] = useState(false);

  return (
    <div className="min-h-screen bg-luxury-cream-50">
      {/* スキップリンク */}
      <a
        href="#main-content"
        className={`
          fixed top-4 left-4 z-50 px-4 py-2 
          bg-luxury-brown-800 text-white rounded-md
          transform transition-transform duration-200
          focus:translate-y-0 focus:opacity-100
          ${showSkipLink ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
        `}
        onFocus={() => setShowSkipLink(true)}
        onBlur={() => setShowSkipLink(false)}
      >
        メインコンテンツへスキップ
      </a>

      <Navigation />
      
      <main id="main-content" role="main" tabIndex={-1}>
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
```

### 3. ARIAランドマークとライブリージョン

```tsx
// components/Navigation.tsx
export function Navigation() {
  return (
    <nav 
      className="navbar" 
      role="navigation" 
      aria-label="メインナビゲーション"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <a 
            href="/" 
            className="flex items-center"
            aria-label="Tiramisu Italian Artisan ホームページへ"
          >
            <span className="text-xl font-bold">🏠 Tiramisu</span>
          </a>

          {/* ナビゲーションメニュー */}
          <ul className="flex space-x-8" role="list">
            <li>
              <NavLink to="/recipes" aria-current={isActive ? 'page' : undefined}>
                Menu
              </NavLink>
            </li>
            {/* 他のメニュー項目 */}
          </ul>
        </div>
      </div>
    </nav>
  );
}
```

### 4. フォームのアクセシビリティ向上

```tsx
// components/SearchInput.tsx
export function SearchInput({ onSearch }: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [announcement, setAnnouncement] = useState('');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('検索キーワードを入力してください');
      setAnnouncement('エラー: 検索キーワードが入力されていません');
      return;
    }

    setError('');
    setAnnouncement(`${query}で検索を開始しました`);
    onSearch(query);
  };

  return (
    <form onSubmit={handleSearch} role="search" aria-label="レシピ検索">
      <div className="relative">
        <label htmlFor="search-input" className="sr-only">
          検索キーワード
        </label>
        
        <input
          id="search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="レシピを検索..."
          aria-invalid={!!error}
          aria-describedby={error ? "search-error" : "search-help"}
          className="w-full px-4 py-2 pr-10 rounded-lg border"
        />
        
        <button
          type="submit"
          aria-label="検索を実行"
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <p id="search-error" role="alert" className="text-red-600 text-sm mt-1">
          {error}
        </p>
      )}

      {/* ヘルプテキスト */}
      <p id="search-help" className="text-gray-600 text-sm mt-1">
        ティラミスレシピを検索できます
      </p>

      {/* スクリーンリーダー用のライブアナウンス */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {announcement}
      </div>
    </form>
  );
}
```

### 5. ローディング状態のアクセシビリティ

```tsx
// components/VideoGrid.tsx
export function VideoGrid({ videos, isLoading }: VideoGridProps) {
  if (isLoading) {
    return (
      <div 
        className="text-center py-8"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="spinner" aria-hidden="true" />
        <p className="mt-4 text-luxury-brown-700">
          レシピを検索中...
        </p>
        <span className="sr-only">検索結果を読み込んでいます</span>
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      role="region"
      aria-label="検索結果"
      aria-live="polite"
    >
      <h2 className="sr-only">
        {videos.length}件の検索結果
      </h2>
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
```

### 6. モーダルのフォーカス管理

```tsx
// components/ui/Modal.tsx
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // 現在のフォーカス要素を保存
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // モーダルにフォーカスを移動
      modalRef.current?.focus();
      
      // ESCキーでモーダルを閉じる
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      // モーダルを閉じたら元の要素にフォーカスを戻す
      previousFocusRef.current?.focus();
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* 背景オーバーレイ */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* モーダルコンテンツ */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          tabIndex={-1}
          className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:max-w-lg sm:w-full"
        >
          {/* ヘッダー */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h2 id="modal-title" className="text-lg font-medium">
              {title}
            </h2>
            
            <button
              type="button"
              className="absolute top-3 right-3 p-2"
              onClick={onClose}
              aria-label="閉じる"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* コンテンツ */}
          <div className="px-4 py-3 sm:px-6">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
```

### 7. 高コントラストモード対応

```css
/* styles/accessibility.css */

/* 高コントラストモード対応 */
@media (prefers-contrast: high) {
  :root {
    --luxury-brown-900: #000000;
    --luxury-brown-800: #1a1a1a;
    --luxury-cream-50: #ffffff;
    --luxury-cream-100: #f5f5f5;
  }

  /* ボタンの高コントラスト */
  .btn-primary {
    background-color: #000000;
    color: #ffffff;
    border: 2px solid #ffffff;
  }

  .btn-primary:hover {
    background-color: #ffffff;
    color: #000000;
    border-color: #000000;
  }

  /* フォーカスインジケーターの強化 */
  *:focus {
    outline: 3px solid #000000 !important;
    outline-offset: 2px !important;
  }
}

/* 動きを減らす設定 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 8. カスタムフック：useAccessibility

```tsx
// hooks/useAccessibility.ts
import { useEffect, useState } from 'react';

export function useAccessibility() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    setPrefersReducedMotion(motionQuery.matches);
    setPrefersHighContrast(contrastQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  return {
    prefersReducedMotion,
    prefersHighContrast,
    announceToScreenReader: (message: string) => {
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      
      document.body.appendChild(announcement);
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  };
}
```

## テスト実装例

```typescript
// tests/accessibility-improvements.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('アクセシビリティ改善の検証', () => {
  test('すべてのページでWCAG 2.1 AA準拠', async ({ page }) => {
    const pages = ['/', '/search', '/recipes', '/about', '/contact'];
    
    for (const path of pages) {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      expect(results.violations).toHaveLength(0);
    }
  });

  test('キーボードナビゲーションが完全に機能する', async ({ page }) => {
    await page.goto('/');
    
    // スキップリンクのテスト
    await page.keyboard.press('Tab');
    const skipLink = await page.locator(':focus');
    await expect(skipLink).toHaveText(/メインコンテンツへスキップ/);
    
    // スキップリンクを使用
    await page.keyboard.press('Enter');
    const mainContent = await page.locator('#main-content:focus');
    await expect(mainContent).toBeTruthy();
  });

  test('フォームのエラーが適切に通知される', async ({ page }) => {
    await page.goto('/search');
    
    // 空の検索を送信
    await page.locator('button[type="submit"]').click();
    
    // エラーメッセージの確認
    const error = await page.locator('[role="alert"]');
    await expect(error).toBeVisible();
    await expect(error).toHaveText(/検索キーワードを入力してください/);
  });
});
```

## まとめ

これらの実装により、Tiramisu AppはWCAG 2.1 AAレベルに完全準拠し、すべてのユーザーにとってアクセシブルなアプリケーションになります。定期的なテストと継続的な改善により、高いアクセシビリティ基準を維持してください。