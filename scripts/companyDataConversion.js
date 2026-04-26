const fs = require('fs');
const path = require('path');

const dataJsonPath = path.join(__dirname, '../resources/data.json')
const companyDataPath = path.join(__dirname, '../resources/companyData.json')

function convertData(){
    const rawData = fs.readFileSync(dataJsonPath, 'utf-8');
    const data = JSON.parse(rawData)

    let companyData = {};
    if(fs.existsSync(companyDataPath)){
        const rawCompanyData = fs.readFileSync(companyDataPath, 'utf-8').trim();
        if (rawCompanyData) {
            try {
                companyData = JSON.parse(rawCompanyData);
            } catch (e) {
                console.warn("Warning: Could not parse existing companyData.json. Starting fresh.");
            }
        }
    }

    let newEntriesCount = 0;

    data.forEach((question) => {
        if(!question.companies || !question.url) return;

        const title = question.title;

        question.companies.forEach((company) => {
            if(!companyData[company]){
                companyData[company] = [];
            }

            const exists = companyData[company].some((item) => item.url === question.url);

            if(!exists){
                companyData[company].push({
                    title: title,
                    url: question.url
                });
                newEntriesCount++;
            }
        })
    });

    fs.writeFileSync(companyDataPath, JSON.stringify(companyData, null, 2), 'utf-8');
    console.log(`Successfully updated companyData.json with ${newEntriesCount} new entries.`);
}

convertData();