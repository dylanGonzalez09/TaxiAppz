// import axios from 'axios';

import { fetchActiveLanguage } from '@apis/language';
import { fetchActiveCountry } from '@apis/country';
import { fetchRoles } from '@apis/role';

export default async function handler(req, res) {
    try {
        const roleData = await fetchRoles();
        const languageData = await fetchActiveLanguage();
        const countryData = await fetchActiveCountry();

        res.status(200).json({
            roles: roleData.data,
            languages: languageData.data,
            countries: countryData.data,
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching options' });
    }
}
