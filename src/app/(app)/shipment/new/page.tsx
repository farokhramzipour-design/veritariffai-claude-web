import { ShipmentWizard } from '@/components/shipment/ShipmentWizard';

export const metadata = {
  title: 'Steel Export Compliance — Veritariff',
  description: 'Happy Path Workflow: UK → Germany steel export compliance wizard',
};

export default function ShipmentNewPage() {
  return <ShipmentWizard />;
}
