# Tiramisu App パフォーマンス最適化実装ガイド

## 🚀 即座に実装可能な最適化

### 1. lucide-reactの最適化

**現在の問題**: 953.32KBの大容量バンドル

**解決策**: 個別インポートに変更

```typescript
// ❌ 悪い例 - 全体インポート
import * as Icons from 'lucide-react';

// ✅ 良い例 - 個別インポート
import { Search, Menu, User, ShoppingCart, Heart } from 'lucide-react';

// または、さらに最適化
import Search from 'lucide-react/dist/esm/icons/search';
import Menu from 'lucide-react/dist/esm/icons/menu';
```

**実装場所**:
- `/Users/sagarahiroto/Desktop/Tiramisu-app/frontend/src/components/Navigation.tsx`
- `/Users/sagarahiroto/Desktop/Tiramisu-app/frontend/src/components/SearchInput.tsx`
- その他アイコンを使用している全コンポーネント

### 2. 画像最適化

**現在の問題**: tiramisu-hero-1920.jpg (282.74KB)

**解決策**: WebP形式への変換とレスポンシブ画像

```typescript
// components/OptimizedHeroImage.tsx
interface OptimizedHeroImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const OptimizedHeroImage: React.FC<OptimizedHeroImageProps> = ({ 
  src, 
  alt, 
  className 
}) => {
  return (
    <picture>
      <source 
        srcSet={`
          ${src.replace('.jpg', '-480.webp')} 480w,
          ${src.replace('.jpg', '-768.webp')} 768w,
          ${src.replace('.jpg', '-1200.webp')} 1200w,
          ${src.replace('.jpg', '-1920.webp')} 1920w
        `}
        sizes="(max-width: 480px) 480px, (max-width: 768px) 768px, (max-width: 1200px) 1200px, 1920px"
        type="image/webp"
      />
      <img 
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
};
```

### 3. コード分割の実装

**解決策**: React.lazyとSuspenseの活用

```typescript
// App.tsx での実装
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Loading } from './components/ui/Loading';

// ページレベルでの遅延読み込み
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/About'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const RecipesPage = lazy(() => import('./pages/RecipeSearchPage'));
const ContactPage = lazy(() => import('./pages/Contact'));

function App() {
  return (
    <Router>
      <div className="App">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}
```

### 4. Vite設定の最適化

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          ui: ['lucide-react', 'class-variance-authority', 'clsx'],
        },
      },
    },
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
});
```

## 🔧 中期的最適化 (Service Worker実装)

### Service Worker設定

```typescript
// public/sw.js
const CACHE_NAME = 'tiramisu-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/images/tiramisu-hero-480.webp',
  '/images/tiramisu-hero-768.webp',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュがあれば返す、なければネットワークから取得
        return response || fetch(event.request);
      })
  );
});
```

```typescript
// src/utils/registerSW.ts
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};
```

## 📊 パフォーマンス監視の実装

### Real User Monitoring (RUM)

```typescript
// src/utils/performance.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  measurePageLoad(pageName: string): void {
    if (typeof window === 'undefined') return;

    // Navigation Timing API
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paintEntries = performance.getEntriesByType('paint');
        
        const metrics = {
          page: pageName,
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          timestamp: new Date().toISOString(),
        };

        // Analytics service に送信
        this.sendMetrics(metrics);
      }, 0);
    });
  }

  measureComponentRender(componentName: string): (fn: () => void) => void {
    return (fn: () => void) => {
      const start = performance.now();
      fn();
      const end = performance.now();
      
      console.log(`${componentName} render time: ${end - start}ms`);
    };
  }

  private sendMetrics(metrics: any): void {
    // 本番環境では Analytics API に送信
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      }).catch(console.error);
    } else {
      console.log('Performance Metrics:', metrics);
    }
  }
}
```

### React パフォーマンス最適化

```typescript
// src/components/OptimizedVideoGrid.tsx
import React, { memo, useMemo, useCallback } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
}

interface OptimizedVideoGridProps {
  videos: Video[];
  onVideoClick: (video: Video) => void;
}

const VideoItem = memo<{
  index: number;
  style: React.CSSProperties;
  data: { videos: Video[]; onVideoClick: (video: Video) => void };
}>(({ index, style, data }) => {
  const video = data.videos[index];
  
  const handleClick = useCallback(() => {
    data.onVideoClick(video);
  }, [video, data.onVideoClick]);

  return (
    <div style={style} onClick={handleClick}>
      <img src={video.thumbnail} alt={video.title} loading="lazy" />
      <h3>{video.title}</h3>
      <span>{video.duration}</span>
    </div>
  );
});

export const OptimizedVideoGrid: React.FC<OptimizedVideoGridProps> = memo(({
  videos,
  onVideoClick,
}) => {
  const itemData = useMemo(() => ({
    videos,
    onVideoClick,
  }), [videos, onVideoClick]);

  return (
    <Grid
      height={600}
      width={800}
      itemCount={videos.length}
      itemSize={200}
      itemData={itemData}
    >
      {VideoItem}
    </Grid>
  );
});
```

## 🧪 継続的パフォーマンステスト

### CI/CDパフォーマンステスト

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0' # 毎週日曜日

jobs:
  performance:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        
      - name: Install Playwright
        run: npx playwright install
        
      - name: Run performance tests
        run: npm run test:performance
        
      - name: Upload performance report
        uses: actions/upload-artifact@v2
        with:
          name: performance-report
          path: playwright-report-performance/
```

## 📈 期待される改善結果

### 最適化前後の比較

| 指標 | 最適化前 | 最適化後 | 改善率 |
|------|----------|----------|--------|
| JavaScript Bundle | 3.6MB | 1.5MB | 58%↓ |
| First Contentful Paint | 168ms | 120ms | 29%↓ |
| Fast 3G Load Time | 20.26s | 8-10s | 50-60%↓ |
| Slow 3G Load Time | 5.25s | 3-4s | 30-40%↓ |
| Lighthouse Score | 85 | 95+ | 12%↑ |

## 🚀 実装ロードマップ

### Week 1: 即効性のある改善
- [ ] lucide-reactの個別インポート化
- [ ] 未使用依存関係の削除
- [ ] Vite設定の最適化
- [ ] 画像のWebP変換

### Week 2: 構造的改善
- [ ] React.lazyによるコード分割
- [ ] Suspenseとローディング状態の改善
- [ ] バンドル分析の設定

### Week 3: 監視とモニタリング
- [ ] Service Workerの実装
- [ ] パフォーマンス監視システム
- [ ] CI/CDパフォーマンステスト

### Week 4: 最終調整と検証
- [ ] 全体的なパフォーマンステスト
- [ ] 本番環境での検証
- [ ] ドキュメントの更新

## 📚 参考リソース

- [Web Vitals](https://web.dev/vitals/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Vite Performance Guide](https://vitejs.dev/guide/build.html)
- [Service Worker Guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

*このガイドは2025年6月30日のパフォーマンステスト結果に基づいて作成されました。*