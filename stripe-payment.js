// Stripe Payment Integration

// Stripe Payment Links - готовое решение для оплаты
// ВНИМАНИЕ: Если ссылка неактивна, создайте новую в Stripe Dashboard и обновите здесь
// Дефолтная ссылка для услуг без специальной ссылки (обновите на активную при необходимости)
const STRIPE_PAYMENT_LINK_DEFAULT = 'https://buy.stripe.com/test_00w6oIbZT4W21oj9mYgrS02';
const STRIPE_PAYMENT_LINK_DESIGN = 'https://buy.stripe.com/test_00w6oIbZT4W21oj9mYgrS02'; // Для услуги "Веб-дизайн"
const STRIPE_PAYMENT_LINK_DEVELOPMENT = 'https://buy.stripe.com/test_5kQbJ2gg9606aYTgPqgrS03'; // Для услуги "Разработка"
const STRIPE_PAYMENT_LINK_SEO = 'https://buy.stripe.com/test_eVq5kE7JDewCff9ar2grS04'; // Для услуги "SEO оптимизация"
const STRIPE_PAYMENT_LINK_RESPONSIVE = 'https://buy.stripe.com/test_eVq14obZTcou6IDdDegrS05'; // Для услуги "Адаптивность"
const STRIPE_PAYMENT_LINK_SUPPORT = 'https://buy.stripe.com/test_eVq14o8NH74ad71ar2grS06'; // Для услуги "Поддержка"
const STRIPE_PAYMENT_LINK_ECOMMERCE = 'https://buy.stripe.com/test_7sY7sMe811JQ1oj8iUgrS07'; // Для услуги "E-Commerce"

// Для кастомной формы с Payment Elements (опционально)
let stripe;
let elements;
let paymentElement;

// Initialize payment on page load
document.addEventListener('DOMContentLoaded', async function() {
    const modal = document.getElementById('payment-modal');
    const closeBtn = document.getElementById('payment-close');
    const paymentForm = document.getElementById('payment-form');
    
    // Close modal handlers
    if (closeBtn) {
        closeBtn.addEventListener('click', closePaymentModal);
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closePaymentModal();
            }
        });
    }
    
    // Payment method selection
    const methodInputs = document.querySelectorAll('input[name="payment-method"]');
    methodInputs.forEach(input => {
        input.addEventListener('change', function() {
            updatePaymentMethod(this.value);
        });
    });
    
    // Form submission
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
    }
});

// Open payment modal
async function openPaymentModal(serviceName, amount) {
    const modal = document.getElementById('payment-modal');
    const serviceNameEl = document.getElementById('payment-service-name');
    const amountEl = document.getElementById('payment-amount');
    
    if (serviceNameEl) serviceNameEl.textContent = serviceName;
    if (amountEl) amountEl.textContent = formatCurrency(amount);
    
    // Сохранить данные для Payment Link
    sessionStorage.setItem('paymentService', serviceName);
    sessionStorage.setItem('paymentAmount', amount);
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Показываем упрощенную форму с Payment Link
    // Для кастомной формы можно раскомментировать:
    // await initializePayment(amount);
}

// Close payment modal
function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset form
    const form = document.getElementById('payment-form');
    if (form) form.reset();
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(amount);
}

// Initialize Stripe Payment Element
async function initializePayment(amount) {
    try {
        // В реальном приложении здесь должен быть запрос к вашему бэкенду
        // для создания Payment Intent. Для демо используем mock данные
        
        // Mock client secret (в реальном приложении получайте с бэкенда)
        const clientSecret = await createPaymentIntent(amount);
        
        // Create or update elements
        if (!elements) {
            elements = stripe.elements({
                clientSecret: clientSecret,
                appearance: {
                    theme: 'stripe',
                    variables: {
                        colorPrimary: '#6366f1',
                        colorBackground: '#ffffff',
                        colorText: '#1e293b',
                        colorDanger: '#ef4444',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        spacingUnit: '4px',
                        borderRadius: '8px',
                    }
                }
            });
            
            paymentElement = elements.create('payment', {
                layout: 'tabs',
                paymentMethodTypes: ['card'],
            });
            
            paymentElement.mount('#payment-element');
        }
        
    } catch (error) {
        console.error('Error initializing payment:', error);
        showMessage('Ошибка инициализации платежа. Попробуйте позже.', 'error');
    }
}

// Create Payment Intent (mock - в реальном приложении вызывайте ваш бэкенд)
async function createPaymentIntent(amount) {
    // В реальном приложении:
    // const response = await fetch('/api/create-payment-intent', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ amount: amount * 100 }) // Stripe использует копейки
    // });
    // const data = await response.json();
    // return data.clientSecret;
    
    // Для демо возвращаем mock client secret
    // В реальном приложении это должно приходить с вашего бэкенда
    return 'pi_mock_client_secret';
}

// Update payment method
function updatePaymentMethod(method) {
    const paymentElementDiv = document.getElementById('payment-element');
    
    // Очистить предыдущий элемент
    if (paymentElementDiv) {
        paymentElementDiv.innerHTML = '';
    }
    
    // Для демо показываем разные варианты
    switch(method) {
        case 'card':
            if (elements && paymentElement) {
                paymentElement.unmount();
            }
            paymentElement = elements.create('payment', {
                layout: 'tabs',
                paymentMethodTypes: ['card'],
            });
            paymentElement.mount('#payment-element');
            break;
        case 'sbp':
            // Для СБП нужен специальный payment method type
            if (elements && paymentElement) {
                paymentElement.unmount();
            }
            paymentElement = elements.create('payment', {
                layout: 'tabs',
                paymentMethodTypes: ['card'], // СБП требует настройки на бэкенде
            });
            paymentElement.mount('#payment-element');
            showMessage('СБП будет доступен после настройки на сервере', 'info');
            break;
        case 'wallet':
            if (elements && paymentElement) {
                paymentElement.unmount();
            }
            paymentElement = elements.create('payment', {
                layout: 'tabs',
                paymentMethodTypes: ['card'], // Электронные кошельки требуют настройки
            });
            paymentElement.mount('#payment-element');
            showMessage('Электронные кошельки будут доступны после настройки', 'info');
            break;
    }
}

// Handle payment form submission
async function handlePaymentSubmit(event) {
    event.preventDefault();
    
    const submitButton = document.getElementById('submit-payment');
    const buttonText = document.getElementById('button-text');
    const spinner = document.getElementById('spinner');
    
    // Get selected payment method
    const selectedMethod = document.querySelector('input[name="payment-method"]:checked')?.value;
    
    // Disable button and show loading
    submitButton.disabled = true;
    if (buttonText) buttonText.textContent = 'Переход к оплате...';
    if (spinner) spinner.classList.remove('hidden');
    
    try {
        // Используем Stripe Payment Link для простоты
        // Payment Link автоматически обработает все способы оплаты
        
        // Получаем данные из sessionStorage
        const serviceName = sessionStorage.getItem('paymentService') || 'Услуга';
        const amount = sessionStorage.getItem('paymentAmount') || '5000';
        
        // Выбираем правильный Payment Link в зависимости от услуги
        let paymentLink = STRIPE_PAYMENT_LINK_DEFAULT;
        
        // Проверяем услугу "Веб-дизайн"
        if (serviceName.toLowerCase().includes('веб-дизайн') || 
            serviceName.toLowerCase().includes('веб дизайн') ||
            serviceName.toLowerCase().includes('web design') ||
            serviceName.toLowerCase().includes('дизайн')) {
            paymentLink = STRIPE_PAYMENT_LINK_DESIGN;
        }
        // Проверяем услугу "Разработка"
        else if (serviceName.toLowerCase().includes('разработка') || 
                 serviceName.toLowerCase().includes('development')) {
            paymentLink = STRIPE_PAYMENT_LINK_DEVELOPMENT;
        }
        // Проверяем услугу "SEO оптимизация"
        else if (serviceName.toLowerCase().includes('seo') || 
                 serviceName.toLowerCase().includes('оптимизация') ||
                 serviceName.toLowerCase().includes('seo оптимизация')) {
            paymentLink = STRIPE_PAYMENT_LINK_SEO;
        }
        // Проверяем услугу "Адаптивность"
        else if (serviceName.toLowerCase().includes('адаптивность') || 
                 serviceName.toLowerCase().includes('адаптивный') ||
                 serviceName.toLowerCase().includes('responsive') ||
                 serviceName.toLowerCase().includes('mobile')) {
            paymentLink = STRIPE_PAYMENT_LINK_RESPONSIVE;
        }
        // Проверяем услугу "Поддержка"
        else if (serviceName.toLowerCase().includes('поддержка') || 
                 serviceName.toLowerCase().includes('поддержки') ||
                 serviceName.toLowerCase().includes('support') ||
                 serviceName.toLowerCase().includes('техподдержка')) {
            paymentLink = STRIPE_PAYMENT_LINK_SUPPORT;
        }
        // Проверяем услугу "E-Commerce"
        else if (serviceName.toLowerCase().includes('e-commerce') || 
                 serviceName.toLowerCase().includes('ecommerce') ||
                 serviceName.toLowerCase().includes('интернет-магазин') ||
                 serviceName.toLowerCase().includes('магазин') ||
                 serviceName.toLowerCase().includes('shop')) {
            paymentLink = STRIPE_PAYMENT_LINK_ECOMMERCE;
        }
        
        // Проверяем наличие активной ссылки
        if (!paymentLink || paymentLink.includes('undefined') || paymentLink.length < 10) {
            showMessage('Ошибка: ссылка для оплаты не настроена. Пожалуйста, свяжитесь с нами для оформления заказа.', 'error');
            submitButton.disabled = false;
            if (buttonText) buttonText.textContent = 'Оплатить';
            if (spinner) spinner.classList.add('hidden');
            return;
        }
        
        // Создаем URL с параметрами для возврата
        const returnUrl = `${window.location.origin}/thank-you.html?service=${encodeURIComponent(serviceName)}&amount=${amount}`;
        const paymentLinkWithParams = `${paymentLink}?client_reference_id=${Date.now()}&success_url=${encodeURIComponent(returnUrl)}`;
        
        // Перенаправляем на Stripe Payment Link
        window.location.href = paymentLinkWithParams;
        
        // Альтернативный вариант с модальным окном (если нужен кастомный UI):
        // await processCustomPayment(selectedMethod, amount);
        
    } catch (error) {
        console.error('Payment error:', error);
        showMessage('Произошла ошибка при обработке платежа. Попробуйте еще раз.', 'error');
        submitButton.disabled = false;
        if (buttonText) buttonText.textContent = 'Оплатить';
        if (spinner) spinner.classList.add('hidden');
    }
}

// Show message
function showMessage(message, type = 'info') {
    const messageEl = document.getElementById('payment-message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `payment-message payment-message-${type}`;
        messageEl.style.display = 'block';
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }
}

// Make function global for onclick handlers
window.openPaymentModal = openPaymentModal;

