const CART_KEY = "techstore-cart";
const PROMO_KEY = "techstore-promo";
const TAX_RATE = 0.08;
const PROMO_CODE = "SAVE10";
const PROMO_DISCOUNT = 0.1;

function getProductById(id) {
  return PRODUCTS.find((product) => product.id === id);
}


