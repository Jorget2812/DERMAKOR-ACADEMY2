import { redirect } from 'next/navigation';

export default function ShopRedirectPage() {
    // Redirección consistente al dashboard profesional
    redirect('/fr/app/shop');
}
