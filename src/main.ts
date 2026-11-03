import { createVaporApp, type VaporComponent } from 'vue'
import App from './App.vue'
import './style.css'

// vize が生成する .vue の型は VDOM コンポーネント相当のため、Vapor ルートとして明示的に扱う
createVaporApp(App as VaporComponent).mount('#root')
