// Configuration
const BASE_PATH = './raw/'; // Path to the book content

// DOM Elements
const tocBtn = document.getElementById('tocBtn');
const themeBtn = document.getElementById('themeBtn');
const tocDiv = document.getElementById('toc');
const tocContent = document.getElementById('tocContent');
const loadingDiv = document.getElementById('loading');
const contentDiv = document.getElementById('content');
const headerTitle = document.getElementById('headerTitle');

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
}

function updateThemeButton(theme) {
    themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
});

// TOC Toggle
tocBtn.addEventListener('click', () => {
    tocDiv.classList.toggle('visible');
});

// Table of Contents Data
const tocData = [
    { title: "Preface", url: "pr01.html", type: "chapter" },
    { title: "Part I: Introductory Material", url: "part1.html", type: "part" },
    { title: "1. The Intersection of Security and Reliability", url: "ch01.html", type: "chapter" },
    { title: "2. Understanding Adversaries", url: "ch02.html", type: "chapter" },
    { title: "Part II: Designing Systems", url: "part2.html", type: "part" },
    { title: "3. Case Study: Safe Proxies", url: "ch03.html", type: "chapter" },
    { title: "4. Design Tradeoffs", url: "ch04.html", type: "chapter" },
    { title: "5. Design for Least Privilege", url: "ch05.html", type: "chapter" },
    { title: "6. Design for Understandability", url: "ch06.html", type: "chapter" },
    { title: "7. Design for a Changing Landscape", url: "ch07.html", type: "chapter" },
    { title: "8. Design for Resilience", url: "ch08.html", type: "chapter" },
    { title: "9. Design for Recovery", url: "ch09.html", type: "chapter" },
    { title: "10. Mitigating Denial-of-Service Attacks", url: "ch10.html", type: "chapter" },
    { title: "Part III: Implementing Systems", url: "part3.html", type: "part" },
    { title: "11. Case Study: Designing, Implementing, and Maintaining a Publicly Trusted CA", url: "ch11.html", type: "chapter" },
    { title: "12. Writing Code", url: "ch12.html", type: "chapter" },
    { title: "13. Testing Code", url: "ch13.html", type: "chapter" },
    { title: "14. Deploying Code", url: "ch14.html", type: "chapter" },
    { title: "15. Investigating Systems", url: "ch15.html", type: "chapter" },
    { title: "Part IV: Maintaining Systems", url: "part4.html", type: "part" },
    { title: "16. Disaster Planning", url: "ch16.html", type: "chapter" },
    { title: "17. Crisis Management", url: "ch17.html", type: "chapter" },
    { title: "18. Recovery and Aftermath", url: "ch18.html", type: "chapter" },
    { title: "Part V: Organization and Culture", url: "part5.html", type: "part" },
    { title: "19. Case Study: Chrome Security Team", url: "ch19.html", type: "chapter" },
    { title: "20. Understanding Roles and Responsibilities", url: "ch20.html", type: "chapter" },
    { title: "21. Building a Culture of Security and Reliability", url: "ch21.html", type: "chapter" },
    { title: "Conclusion", url: "ch22.html", type: "chapter" },
    { title: "Appendix: A Disaster Risk Assessment Matrix", url: "appa.html", type: "chapter" }
];

// Build Table of Contents
function buildTOC() {
    const ul = document.createElement('ul');
    
    tocData.forEach((item, index) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = item.title;
        a.className = item.type;
        a.dataset.index = index;
        
        a.addEventListener('click', async (e) => {
            e.preventDefault();
            tocDiv.classList.remove('visible');
            await loadChapter(item.url, item.title);
            saveProgress(index);
        });
        
        li.appendChild(a);
        ul.appendChild(li);
    });
    
    tocContent.appendChild(ul);
}

// Load Chapter
async function loadChapter(filename, title) {
    showLoading();
    contentDiv.innerHTML = '';
    window.scrollTo(0, 0);
    
    try {
        const response = await fetch(BASE_PATH + filename);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract the main content (try different selectors)
        let mainContent = doc.querySelector('body');
        
        if (mainContent) {
            contentDiv.innerHTML = mainContent.innerHTML;
            
            // Update header title
            if (title) {
                headerTitle.textContent = title;
            }
            
            // Fix relative image URLs
            fixImageURLs();
            
            // Fix internal links
            fixInternalLinks();
            
            // Remove any scripts for safety
            removeScripts();
        }
        
        hideLoading();
    } catch (error) {
        console.error('Error loading chapter:', error);
        showError(filename);
    }
}

// Fix image URLs
function fixImageURLs() {
    const images = contentDiv.querySelectorAll('img');
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('data:')) {
            img.src = BASE_PATH + src;
        }
    });
}

// Fix internal links to use the reader
function fixInternalLinks() {
    const links = contentDiv.querySelectorAll('a');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('#') && href.endsWith('.html')) {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const item = tocData.find(item => item.url === href);
                await loadChapter(href, item ? item.title : null);
                if (item) {
                    saveProgress(tocData.indexOf(item));
                }
            });
        }
    });
}

// Remove scripts for security
function removeScripts() {
    const scripts = contentDiv.querySelectorAll('script');
    scripts.forEach(script => script.remove());
}

// Loading States
function showLoading() {
    loadingDiv.classList.add('visible');
    contentDiv.style.display = 'none';
}

function hideLoading() {
    loadingDiv.classList.remove('visible');
    contentDiv.style.display = 'block';
}

function showError(filename) {
    hideLoading();
    contentDiv.innerHTML = `
        <div class="error">
            <strong>Error Loading Chapter</strong><br><br>
            Could not load <code>${filename}</code><br><br>
            Please check that the file exists in the <code>raw/</code> directory.
        </div>
    `;
    contentDiv.style.display = 'block';
}

// Progress Management
function saveProgress(index) {
    localStorage.setItem('lastChapter', index);
}

function loadProgress() {
    const lastChapter = localStorage.getItem('lastChapter');
    if (lastChapter !== null) {
        const index = parseInt(lastChapter);
        if (tocData[index]) {
            return index;
        }
    }
    return 0; // Default to first chapter
}

// Initialize
function init() {
    initTheme();
    buildTOC();
    
    // Load last read chapter or first chapter
    const lastIndex = loadProgress();
    const item = tocData[lastIndex];
    loadChapter(item.url, item.title);
}

// Start the app
init();