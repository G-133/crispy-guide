// Stripe Payment Integration

// Stripe Payment Link - готовое решение для оплаты
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_6oU28sd3Xcoud718iUgrS00';

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
        
        // Создаем URL с параметрами для возврата
        const returnUrl = `${window.location.origin}/thank-you.html?service=${encodeURIComponent(serviceName)}&amount=${amount}`;
        const paymentLinkWithParams = `${STRIPE_PAYMENT_LINK}?client_reference_id=${Date.now()}&success_url=${encodeURIComponent(returnUrl)}`;
        
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

