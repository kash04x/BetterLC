const button = document.createElement("div");
button.className = "floating-button";
const img = document.createElement("img");
(img.src = chrome.runtime.getURL("resources/icon.png")), (img.className = "button-image");
const tooltip = document.createElement("div");
(tooltip.className = "tooltip"),
  button.appendChild(img),
  button.appendChild(tooltip),
  document.body.appendChild(button);

function updateCompanies(currentUrl){
  const match = currentUrl.match(/https:\/\/leetcode\.com\/problems\/[^\/]+\//);
  if(!match) return;
  const baseUrl = match[0];
  
  tooltip.innerHTML = '';

  Promise.all([
    fetch(chrome.runtime.getURL("resources/data.json")).then(res => res.json()),
    fetch(chrome.runtime.getURL("resources/companyData.json")).then(res => res.json())
  ]).then(([mainData, companyDataMap]) => {
    const currentQuestion = mainData.find(q => q.url === baseUrl);
    const companies = currentQuestion ? currentQuestion.companies : ["Data Unavailable"];

    companies.forEach((companyName) => {
      const companyDiv = document.createElement("div");
      companyDiv.className = "company"
      companyDiv.textContent = companyName
      tooltip.appendChild(companyDiv);
    })

    setTimeout(() => {
      let expansionOverlay = document.querySelector('.company-expansion-overlay');
      if (!expansionOverlay) {
        expansionOverlay = document.createElement('div');
        expansionOverlay.className = 'company-expansion-overlay';
        document.body.appendChild(expansionOverlay);
      }
      
      let questionsModal = document.querySelector('.company-questions-modal');
      if (!questionsModal) {
        questionsModal = document.createElement('div');
        questionsModal.className = 'company-questions-modal';
        questionsModal.style.cssText = `
          display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.75); z-index: 10000; align-items: center; justify-content: center;
          backdrop-filter: blur(3px); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        `;
        document.body.appendChild(questionsModal);
        
        questionsModal.addEventListener('click', (e) => {
          if (e.target === questionsModal) questionsModal.style.display = 'none';
        });
      }
      
      document.querySelectorAll('.company').forEach(company => {
        const companyName = company.textContent;
        company.setAttribute('data-full-text', company.textContent);
        
        // Add hover event listeners to all companies
        company.addEventListener('mouseenter', (e) => {
          const rect = company.getBoundingClientRect();
          expansionOverlay.textContent = company.getAttribute('data-full-text');
          expansionOverlay.style.display = 'block';
          
          // Calculate center position after overlay is displayed
          const overlayRect = expansionOverlay.getBoundingClientRect();
          const centerX = rect.left + (rect.width / 2) - (overlayRect.width / 2);
          const centerY = rect.top + (rect.height / 2) - (overlayRect.height / 2);
          
          expansionOverlay.style.left = centerX + 'px';
          expansionOverlay.style.top = centerY + 'px';
        });
        
        company.addEventListener('mouseleave', () => {
          expansionOverlay.style.display = 'none';
        });

        company.addEventListener('click', ()=>{
          if (companyName === "Data Unavailable") return;

          const questionsList = companyDataMap[companyName] || [];

          const filtered = questionsList.filter(q => q.url !== baseUrl);

          const shuffled = filtered.sort(() => 0.5 - Math.random());

          const topThree = shuffled.slice(0,3);

          let questionsModal = document.querySelector('.company-questions-modal');
          questionsModal.innerHTML = `
            <div style="background: #282828; padding: 24px; border-radius: 12px; min-width: 320px; max-width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: flex; flex-direction: column;">
              <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 18px; color: #fff; border-bottom: 1px solid #444; padding-bottom: 12px;">More from ${companyName}</h2>
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${topThree.length > 0 
                  ? topThree.map(q => `<a href="${q.url}" style="color: #60a5fa; text-decoration: none; padding: 12px; background: #333; border-radius: 8px; font-size: 15px; font-weight: 500;">${q.title}</a>`).join('')
                  : '<p style="color: #aaa; margin: 0; font-size: 14px;">No other questions found.</p>'
                }
              </div>
              <button class="close-modal-btn" style="margin-top: 24px; padding: 12px; background: #555; border: none; color: white; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: bold;">Close</button>
            </div>
          `;
          
          questionsModal.querySelector('.close-modal-btn').addEventListener('click', () => {
            questionsModal.style.display = 'none';
          });

          questionsModal.style.display = 'flex';
        });
      });
    }, 100);
  }).catch((t) => console.error("Error fetching JSON:", t));  
}
updateCompanies(window.location.href);

let lastUrl = window.location.href;
let debounceTimer;
new MutationObserver(()=> {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {if(window.location.href !== lastUrl){
    lastUrl = window.location.href;
    updateCompanies(lastUrl);
  }}, 250)
}).observe(document, {subtree: true, childList: true})
