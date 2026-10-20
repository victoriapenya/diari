import './style.css';
import { store } from './store/index.js';
import { createApp } from './ui/app.js';

createApp({ root: document, store }).start();
