import axios from 'axios'

declare global {
    interface Window {
        PaystackPop: any
    }
}

interface PaymentDetails {
    email: string
    amount: number
    reference: string
    metadata: {
        studentId: string
        feeType: string
        academicYear: string
    }
}

export class PaymentService {
    private publicKey: string

    constructor() {
        this.publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ''

        // Load Paystack script
        this.loadScript()
    }

    private loadScript() {
        const script = document.createElement('script')
        script.src = 'https://js.paystack.co/v1/inline.js'
        script.async = true
        document.body.appendChild(script)
    }

    async initializePayment(details: PaymentDetails): Promise<void> {
        return new Promise((resolve, reject) => {
            const handler = window.PaystackPop.setup({
                key: this.publicKey,
                email: details.email,
                amount: details.amount * 100, // Convert to kobo
                ref: details.reference,
                metadata: details.metadata,
                callback: async (response: any) => {
                    // Verify payment on your backend
                    try {
                        await this.verifyPayment(response.reference)
                        resolve()
                    } catch (error) {
                        reject(error)
                    }
                },
                onClose: () => {
                    reject(new Error('Payment cancelled'))
                },
            })

            handler.openIframe()
        })
    }

    private async verifyPayment(reference: string) {
        const response = await axios.post('/api/payments/verify', { reference })
        return response.data
    }

    generateReference(): string {
        return `PAY-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
    }
}