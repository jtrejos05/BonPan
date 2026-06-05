export const categories = ['Todos', 'Croissants', 'Pasteles Salados', 'Hojaldre Dulce', 'Bebidas']

export const products = [
  // Croissants
  { id: 1,  name: 'Croissant de Mantequilla',   category: 'Croissants',       price: 4500,  description: 'Croissant hojaldrado tradicional con mantequilla francesa, dorado y crujiente.',     emoji: '🥐', stock: 20 },
  { id: 2,  name: 'Croissant de Jamón y Queso', category: 'Croissants',       price: 6500,  description: 'Croissant relleno de jamón serrano y queso gouda derretido.',                         emoji: '🥐', stock: 15 },
  { id: 3,  name: 'Croissant de Almendras',     category: 'Croissants',       price: 5800,  description: 'Croissant cubierto de crema de almendras y láminas tostadas.',                        emoji: '🥐', stock: 12 },
  { id: 4,  name: 'Croissant de Chocolate',     category: 'Croissants',       price: 5500,  description: 'Pain au chocolat con barras de chocolate semi-amargo en masa hojaldrada.',            emoji: '🥐', stock: 18 },
  { id: 5,  name: 'Croissant de Espinaca',      category: 'Croissants',       price: 6000,  description: 'Croissant salado relleno de espinaca salteada con ajo y queso crema.',                emoji: '🥐', stock: 10 },

  // Pasteles Salados
  { id: 6,  name: 'Pastel de Pollo',            category: 'Pasteles Salados', price: 8500,  description: 'Hojaldre relleno de pollo desmechado con verduras y salsa bechamel especiada.',      emoji: '🥧', stock: 14 },
  { id: 7,  name: 'Pastel de Carne',            category: 'Pasteles Salados', price: 9000,  description: 'Hojaldre dorado con carne molida, cebolla caramelizada y hierbas aromáticas.',        emoji: '🥧', stock: 12 },
  { id: 8,  name: 'Pastelito de Pollo',         category: 'Pasteles Salados', price: 5500,  description: 'Porción individual de hojaldre relleno de pollo en salsa suave. Ideal para llevar.',  emoji: '🥧', stock: 20 },
  { id: 9,  name: 'Pastelito de Carne',         category: 'Pasteles Salados', price: 5800,  description: 'Mini pastel hojaldrado con carne molida y papas. Crujiente por fuera, jugoso por dentro.', emoji: '🥧', stock: 20 },
  { id: 10, name: 'Vol-au-vent de Pollo',       category: 'Pasteles Salados', price: 7500,  description: 'Canastilla de hojaldre rellena de pollo en salsa de champiñones y crema.',           emoji: '🥧', stock: 8  },
  { id: 11, name: 'Empanada de Hojaldre Carne', category: 'Pasteles Salados', price: 4800,  description: 'Empanada crujiente de masa hojaldrada con guiso de carne y aceitunas.',               emoji: '🥧', stock: 25 },
  { id: 12, name: 'Empanada de Hojaldre Pollo', category: 'Pasteles Salados', price: 4800,  description: 'Empanada hojaldrada con relleno de pollo, champiñones y hierbas finas.',              emoji: '🥧', stock: 25 },

  // Hojaldre Dulce
  { id: 13, name: 'Milhojas de Crema',          category: 'Hojaldre Dulce',   price: 7500,  description: 'Capas de hojaldre crujiente con crema pastelera de vainilla y azúcar glass.',         emoji: '🍰', stock: 10 },
  { id: 14, name: 'Palmera de Azúcar',          category: 'Hojaldre Dulce',   price: 3500,  description: 'Galleta de hojaldre enrollada en azúcar caramelizada. Crujiente y deliciosa.',        emoji: '🍪', stock: 30 },
  { id: 15, name: 'Tarta de Manzana Hojaldre',  category: 'Hojaldre Dulce',   price: 9500,  description: 'Base de hojaldre con crema de almendras y láminas de manzana acarameladas.',          emoji: '🥧', stock: 6  },
  { id: 16, name: 'Napolitana de Chocolate',    category: 'Hojaldre Dulce',   price: 5000,  description: 'Triángulo de hojaldre relleno de crema de chocolate y avellana.',                     emoji: '🍫', stock: 15 },
  { id: 17, name: 'Strudel de Frutas',          category: 'Hojaldre Dulce',   price: 8000,  description: 'Rollo hojaldrado con manzana, canela, pasas y nueces. Receta vienesa.',               emoji: '🥧', stock: 8  },

  // Bebidas
  { id: 18, name: 'Café Americano',             category: 'Bebidas',          price: 4000,  description: 'Café de origen colombiano, tostado en casa.',                                         emoji: '☕', stock: 50 },
  { id: 19, name: 'Chocolate Caliente',         category: 'Bebidas',          price: 5500,  description: 'Chocolate espeso con leche entera y canela. El maridaje perfecto del hojaldre.',      emoji: '☕', stock: 50 },
  { id: 20, name: 'Capuchino',                  category: 'Bebidas',          price: 6000,  description: 'Espresso doble con espuma de leche cremosa y toque de canela.',                       emoji: '☕', stock: 50 },
]
