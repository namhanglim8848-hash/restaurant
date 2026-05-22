// State Variables
let isEditing = false;

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    loadTheme();
    loadCVData();
    syncLinks();
});

// Theme Management
function selectTheme(themeName) {
    document.documentElement.setAttribute("data-theme", themeName);
    localStorage.setItem("cv_theme", themeName);
    
    // Update active class on buttons
    document.querySelectorAll(".theme-btn").forEach(btn => {
        if (btn.getAttribute("data-theme-val") === themeName) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

function loadTheme() {
    const savedTheme = localStorage.getItem("cv_theme") || "midnight";
    selectTheme(savedTheme);
}

// Edit Mode Management
function toggleEditMode() {
    const fields = document.querySelectorAll(".editable-field");
    const editBtn = document.getElementById("editBtn");
    const editIndicator = document.getElementById("editIndicator");
    
    isEditing = !isEditing;
    
    if (isEditing) {
        // Turn ON editing
        fields.forEach(field => {
            field.setAttribute("contenteditable", "true");
        });
        
        editBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 1rem; height: 1rem; color: #10b981;">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Save CV
        `;
        editBtn.classList.add("btn-action");
        editIndicator.style.display = "inline-block";
    } else {
        // Turn OFF editing and Save
        fields.forEach(field => {
            field.removeAttribute("contenteditable");
        });
        
        saveCVData();
        syncLinks();
        
        editBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 1rem; height: 1rem;">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
            Edit CV
        `;
        editBtn.classList.remove("btn-action");
        editIndicator.style.display = "none";
        
        showToast();
    }
}

// Persist Data in LocalStorage
function saveCVData() {
    const fields = document.querySelectorAll(".editable-field");
    const data = Array.from(fields).map(el => el.innerHTML.trim());
    localStorage.setItem("cv_data", JSON.stringify(data));
}

function loadCVData() {
    const fields = document.querySelectorAll(".editable-field");
    const saved = localStorage.getItem("cv_data");
    
    if (saved) {
        try {
            const data = JSON.parse(saved);
            // Safety check: only load if the template structure matches
            if (data.length === fields.length) {
                fields.forEach((el, index) => {
                    if (data[index] !== undefined) {
                        el.innerHTML = data[index];
                    }
                });
            } else {
                console.warn("Template structure changed. Loading default values.");
                localStorage.removeItem("cv_data");
            }
        } catch (e) {
            console.error("Error loading CV data from localstorage:", e);
        }
    }
}

// Synchronize Link Hrefs with Anchor Span Texts
function syncLinks() {
    // Email Link
    const emailSpan = document.getElementById("cv-email");
    const emailLink = document.getElementById("cv-email-link");
    if (emailSpan && emailLink) {
        const email = emailSpan.textContent.trim();
        emailLink.setAttribute("href", `mailto:${email}`);
    }

    // Phone Link
    const phoneSpan = document.getElementById("cv-phone");
    const phoneLink = document.getElementById("cv-phone-link");
    if (phoneSpan && phoneLink) {
        const phone = phoneSpan.textContent.trim().replace(/[^a-zA-Z0-9+]/g, ""); // Strip non-numeric/plus
        phoneLink.setAttribute("href", `tel:${phone}`);
    }

    // GitHub Link
    const githubSpan = document.getElementById("cv-github");
    const githubLink = document.getElementById("cv-github-link");
    if (githubSpan && githubLink) {
        let github = githubSpan.textContent.trim();
        if (!github.startsWith("http://") && !github.startsWith("https://")) {
            github = `https://${github}`;
        }
        githubLink.setAttribute("href", github);
    }

    // LinkedIn Link
    const linkedinSpan = document.getElementById("cv-linkedin");
    const linkedinLink = document.getElementById("cv-linkedin-link");
    if (linkedinSpan && linkedinLink) {
        let linkedin = linkedinSpan.textContent.trim();
        if (!linkedin.startsWith("http://") && !linkedin.startsWith("https://")) {
            linkedin = `https://${linkedin}`;
        }
        linkedinLink.setAttribute("href", linkedin);
    }
}

// Reset CV data to default template
function resetCV() {
    if (confirm("Are you sure you want to reset all customized text back to the default template? Your manual edits will be lost.")) {
        localStorage.removeItem("cv_data");
        localStorage.removeItem("cv_theme");
        window.location.reload();
    }
}

// Print and PDF export
function printCV() {
    // Turn off edit mode if it's active
    if (isEditing) {
        toggleEditMode();
    }
    
    // Trigger Print Dialog
    window.print();
}

// Show Alert Toast
function showToast() {
    const toast = document.getElementById("saveToast");
    toast.classList.add("show");
    
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}
