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

fetch(chrome.runtime.getURL("resources/data.json"))
  .then((t) => t.json())
  .then((t) => {
    const e = t.find((t) => t.url === baseUrl),
      o = e ? e.companies : ["Data Unavailable"];
    o.forEach((t) => {
      const e = document.createElement("div");
      (e.className = "company"), (e.textContent = t), tooltip.appendChild(e);
    });
    
    // Add expansion overlay for all company names
    setTimeout(() => {
      let expansionOverlay = document.querySelector('.company-expansion-overlay');
      if (!expansionOverlay) {
        expansionOverlay = document.createElement('div');
        expansionOverlay.className = 'company-expansion-overlay';
        document.body.appendChild(expansionOverlay);
      }
      
      document.querySelectorAll('.company').forEach(company => {
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
      });
    }, 100);
  })
  .catch((t) => console.error("Error fetching JSON:", t));
}
updateCompanies(window.location.href);

let lastUrl = window.location.href;
new MutationObserver(()=> {
  if(window.location.href !== lastUrl){
    lastUrl = window.location.href;
    updateCompanies(lastUrl);
  }
}).observe(document, {subtree: true, childList: true})
