/**
 * Объявление типов для CSS модулей и обычных CSS файлов
 * Позволяет TypeScript корректно типизировать импорты CSS
 */

// Для CSS модулей (с поддержкой классов)
declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

// Для обычных CSS файлов (side-effect imports)
declare module '*.css' {
  const content: string;
  export default content;
}
