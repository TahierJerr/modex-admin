const formatPrice = (price: number) => {
    let formattedPrice = price.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
    formattedPrice = formattedPrice.replace('.', ',');

    const parts = formattedPrice.split(',');
    if (parts.length === 1) {
        formattedPrice += '00';
    } else if (parts[1].length === 1) {
        formattedPrice += '0';
    }

    return formattedPrice;
};

export default formatPrice;