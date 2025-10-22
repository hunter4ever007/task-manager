// PWA Installer Manager

export class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.installButton = null;
        this.installContainer = null;
        
        // Initialize the installer
        this.init();
    }
    
    init() {
        // Create the install button container if it doesn't exist
        this.createInstallUI();
        
        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            this.deferredPrompt = e;
            // Show the install button
            this.showInstallButton();
        });
        
        // Listen for the appinstalled event
        window.addEventListener('appinstalled', () => {
            // Log install to analytics
            console.log('PWA was installed');
            // Hide the install button
            this.hideInstallButton();
            // Clear the deferredPrompt
            this.deferredPrompt = null;
        });
    }
    
    createInstallUI() {
        // Create install container
        this.installContainer = document.createElement('div');
        this.installContainer.className = 'install-container';
        this.installContainer.style.display = 'none';
        
        // Create install button
        this.installButton = document.createElement('button');
        this.installButton.className = 'install-button';
        this.installButton.innerHTML = '<i class="fas fa-download"></i> <span data-en="Install App" data-ar="تثبيت التطبيق">Install App</span>';
        
        // Add click event to install button
        this.installButton.addEventListener('click', () => this.installPWA());
        
        // Append button to container
        this.installContainer.appendChild(this.installButton);
        
        // Append container to body
        document.body.appendChild(this.installContainer);
        
        // Add styles for the install button
        this.addInstallStyles();
    }
    
    addInstallStyles() {
        // Create a style element if it doesn't exist
        if (!document.getElementById('pwa-install-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'pwa-install-styles';
            
            // Add CSS for the install button
            styleElement.textContent = `
                .install-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1000;
                    animation: fadeIn 0.3s ease;
                }
                
                [dir="rtl"] .install-container {
                    right: auto;
                    left: 20px;
                }
                
                .install-button {
                    background-color: var(--primary-color);
                    color: white;
                    border: none;
                    padding: 10px 15px;
                    border-radius: var(--border-radius-md);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 2px 5px var(--shadow-color);
                    transition: background-color var(--transition-fast);
                }
                
                .install-button:hover {
                    background-color: var(--primary-dark);
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @media (max-width: 768px) {
                    .install-container {
                        top: auto;
                        bottom: 70px;
                        right: 20px;
                    }
                    
                    [dir="rtl"] .install-container {
                        right: auto;
                        left: 20px;
                    }
                }
            `;
            
            // Append the style element to the head
            document.head.appendChild(styleElement);
        }
    }
    
    showInstallButton() {
        if (this.installContainer) {
            this.installContainer.style.display = 'block';
        }
    }
    
    hideInstallButton() {
        if (this.installContainer) {
            this.installContainer.style.display = 'none';
        }
    }
    
    async installPWA() {
        if (!this.deferredPrompt) {
            console.log('Installation prompt not available');
            return;
        }
        
        // Show the installation prompt
        this.deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        
        // Clear the deferredPrompt variable
        this.deferredPrompt = null;
        
        // Hide the install button
        this.hideInstallButton();
    }
}

// Initialize the PWA installer when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PWAInstaller();
});