import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CreditCardIcon, Euro, } from "lucide-react";
import { formatter } from "@/lib/utils";
import { getTotalRevenue } from "@/actions/get-total-revenue";
import { getSales } from "@/actions/get-total-sales";
import Overview from "@/components/overview";
import { getGraphRevenue } from "@/actions/get-graph-revenue";

interface DashboardPageProps {
    params: { storeId: string };
};

const DashboardPage: React.FC<DashboardPageProps> = async ({
    params 
}) => {
    const totalRevenue = await getTotalRevenue(params.storeId);
    const salesCount = await getSales(params.storeId);
    const graphRevenue = await getGraphRevenue(params.storeId);

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <Heading title="Dashboard" description="Overview of your store"/>
                <Separator />
                <div className="grid gap-4 grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                            Total Revenue
                            </CardTitle>
                        <Euro className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatter.format(totalRevenue)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                            Sales
                            </CardTitle>
                        <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                +{salesCount}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Overview data={graphRevenue} />
            </div>
        </div>
    );
    };

export default DashboardPage;