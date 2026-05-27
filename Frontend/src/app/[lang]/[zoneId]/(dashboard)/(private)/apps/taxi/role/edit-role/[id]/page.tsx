import { fetchPrivillage } from '@apis/privillege';
import EditRole from '@/views/apps/taxi/role/edit-role';
import { getDictionary } from '@/utils/getDictionary';
import type { Locale } from '@/configs/i18n';

const EditRolePage = async ({ params }: { params: { lang: Locale, id: string; } }) => {
    const id = String(params.id);

    const privilegeData = await fetchPrivillage(params.id);

  const dictionary = await getDictionary(params.lang);

    return (
        <div>
            <EditRole privilegeData={privilegeData} roleId={id} dictionary={dictionary}/>
        </div>
    );
};

export default EditRolePage;
