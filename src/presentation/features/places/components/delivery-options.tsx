/**
 * DeliveryOptions Component
 * 
 * Shows delivery service integrations (Talabat, Glovo) and call-for-delivery
 */

'use client';

import { Bike, Phone } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';
import { Card } from '@/presentation/components/ui/Card';

interface DeliveryOptionsProps {
    talabatUrl?: string;
    glovoUrl?: string;
    deliveryPhone?: string;
    placeName: string;
}

export function DeliveryOptions({ talabatUrl, glovoUrl, deliveryPhone, placeName }: DeliveryOptionsProps) {
    // Don't render if no delivery options available
    if (!talabatUrl && !glovoUrl && !deliveryPhone) {
        return null;
    }

    return (
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Bike className="w-6 h-6 text-orange-600" />
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                        خدمات التوصيل
                    </h3>
                </div>

                <div className="space-y-3">
                    {/* Talabat */}
                    {talabatUrl && (
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={() => window.open(talabatUrl, '_blank')}
                            className="bg-orange-600 hover:bg-orange-700"
                            icon={
                                <img
                                    src="/icons/talabat.png"
                                    alt="Talabat"
                                    className="w-5 h-5"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            }
                        >
                            اطلب عبر Talabat
                        </Button>
                    )}

                    {/* Glovo */}
                    {glovoUrl && (
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={() => window.open(glovoUrl, '_blank')}
                            className="bg-yellow-500 hover:bg-yellow-600"
                            icon={
                                <img
                                    src="/icons/glovo.png"
                                    alt="Glovo"
                                    className="w-5 h-5"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            }
                        >
                            اطلب عبر Glovo
                        </Button>
                    )}

                    {/* Direct Call for Delivery */}
                    {deliveryPhone && (
                        <Button
                            variant="outline"
                            fullWidth
                            onClick={() => window.location.href = `tel:${deliveryPhone}`}
                            icon={<Phone className="w-5 h-5" />}
                        >
                            اتصل للتوصيل
                        </Button>
                    )}

                    {/* Note */}
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-3">
                        سيتم فتح التطبيق أو الموقع الإلكتروني لإتمام الطلب
                    </p>
                </div>
            </div>
        </Card>
    );
}
