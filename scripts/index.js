const button = document.createElement("div");
button.className = "floating-button";
const img = document.createElement("img");
(img.src = chrome.runtime.getURL("resources/icon.png")), (img.className = "button-image");
const tooltip = document.createElement("div");
(tooltip.className = "tooltip"),
  button.appendChild(img),
  button.appendChild(tooltip),
  document.body.appendChild(button);
const currentUrl = window.location.href,
  baseUrl = currentUrl.match(/https:\/\/leetcode\.com\/problems\/[^\/]+\//)[0];
fetch(chrome.runtime.getURL("resources/data.json"))
  .then((t) => t.json())
  .then((t) => {
    // Build company -> list of LeetCode URLs
    const companyUrlMap = {};
    t.forEach(entry => {
      entry.companies.forEach(company => {
        if (!companyUrlMap[company]) companyUrlMap[company] = [];
        companyUrlMap[company].push(entry.url);
      });
    });
    // company list
    const e = t.find((t) => t.url === baseUrl), o = e ? e.companies : ["Data Unavailable"];
    o.forEach((t) => {
      const e = document.createElement("div");
      e.className = "company";
      const count = companyUrlMap[t] ? companyUrlMap[t].length : 0;
      e.textContent = `${t} (${count})`;
      e.setAttribute("key", t); // keep original name
      tooltip.appendChild(e);
    });
    
    // Add expansion overlay for all company names
    setTimeout(() => {
      const expansionOverlay = document.createElement('div');
      expansionOverlay.className = 'company-expansion-overlay';
      document.body.appendChild(expansionOverlay);
      
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

        //for openig url
        company.addEventListener('click', () => {
          const companyName = company.getAttribute('key');
          const urls = companyUrlMap[companyName];
          if (!urls || urls.length === 0) return;
          const randomUrl = urls[Math.floor(Math.random() * urls.length)];
          window.location.href = randomUrl;
        });
        
        company.addEventListener('mouseleave', () => {
          expansionOverlay.style.display = 'none';
        });
      });
    }, 100);
  })
  .catch((t) => console.error("Error fetching JSON:", t));
