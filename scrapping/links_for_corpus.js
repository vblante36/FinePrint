class LegalDocDetector {
    constructor() {
      // Create status indicator with improved layout
      this.statusDiv = document.createElement('div');
      this.statusDiv.style.position = 'fixed';
      this.statusDiv.style.top = '10px';
      this.statusDiv.style.left = '10px'; // Changed from right to left
      this.statusDiv.style.padding = '15px';
      this.statusDiv.style.background = 'rgba(0,0,0,0.8)';
      this.statusDiv.style.color = 'white';
      this.statusDiv.style.zIndex = '9999';
      this.statusDiv.style.borderRadius = '5px';
      this.statusDiv.style.maxWidth = '400px'; // Wider panel
      this.statusDiv.style.maxHeight = '80vh'; // Limit height
      this.statusDiv.style.overflowY = 'auto'; // Add scrolling
      this.statusDiv.style.fontFamily = 'Arial, sans-serif';
      this.statusDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
      document.body.appendChild(this.statusDiv);
      
      // Add a close button
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '×';
      closeBtn.style.position = 'absolute';
      closeBtn.style.right = '5px';
      closeBtn.style.top = '5px';
      closeBtn.style.background = 'transparent';
      closeBtn.style.border = 'none';
      closeBtn.style.color = 'white';
      closeBtn.style.fontSize = '20px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.onclick = () => this.statusDiv.remove();
      this.statusDiv.appendChild(closeBtn);
      
      // Create content container
      this.contentDiv = document.createElement('div');
      this.statusDiv.appendChild(this.contentDiv);
      
      this.updateStatus("Initializing...");
    }
    
    updateStatus(message) {
      this.contentDiv.innerHTML = message;
      console.log(message);
    }
    
    async detectAndDownload() {
      try {
        this.updateStatus("Starting detection process...");
        
        // Look for links using various strategies
        let tosLink = null;
        let privacyLink = null;
        
        // Strategy 1: Look for data attributes
        this.updateStatus("Looking for data-jsl10n attributes...");
        const termsDataElements = document.querySelectorAll('[data-jsl10n="terms"] a, [data-jsl10n*="term"] a');
        const privacyDataElements = document.querySelectorAll('[data-jsl10n="privacy-policy"] a, [data-jsl10n*="privacy"] a');
        
        if (termsDataElements.length > 0 && termsDataElements[0].href) {
          tosLink = termsDataElements[0].href;
          this.updateStatus(`Found Terms link via data attribute:<br><a href="${tosLink}" target="_blank" style="color: #4CAF50;">${tosLink}</a>`);
        }
        
        if (privacyDataElements.length > 0 && privacyDataElements[0].href) {
          privacyLink = privacyDataElements[0].href;
          this.updateStatus(`Found Privacy link via data attribute:<br><a href="${privacyLink}" target="_blank" style="color: #4CAF50;">${privacyLink}</a>`);
        }
        
        // Strategy 2: Check footer links
        if (!tosLink || !privacyLink) {
          this.updateStatus("Looking in footer areas...");
          const footerLinks = document.querySelectorAll('footer a, .footer a, #footer a, [id*="footer"] a');
          
          for (const link of footerLinks) {
            const href = link.href;
            const text = link.textContent.trim().toLowerCase();
            
            if (!tosLink && (text.includes('terms') || href.includes('terms'))) {
              tosLink = href;
              this.updateStatus(`Found Terms link in footer:<br><a href="${tosLink}" target="_blank" style="color: #4CAF50;">${tosLink}</a>`);
            }
            
            if (!privacyLink && (text.includes('privacy') || href.includes('privacy'))) {
              privacyLink = href;
              this.updateStatus(`Found Privacy link in footer:<br><a href="${privacyLink}" target="_blank" style="color: #4CAF50;">${privacyLink}</a>`);
            }
          }
        }
        
        // Strategy 3: Check all links with relevant keywords
        if (!tosLink || !privacyLink) {
          this.updateStatus("Scanning all links for keywords...");
          const allLinks = document.querySelectorAll('a');
          
          for (const link of allLinks) {
            const href = link.href;
            const text = link.textContent.trim().toLowerCase();
            
            if (!tosLink && (
                text.includes('terms') || 
                text.includes('tos') || 
                href.includes('terms') || 
                href.includes('tos')
            )) {
              tosLink = href;
              this.updateStatus(`Found Terms link by keyword:<br><a href="${tosLink}" target="_blank" style="color: #4CAF50;">${tosLink}</a>`);
            }
            
            if (!privacyLink && (
                text.includes('privacy') || 
                href.includes('privacy')
            )) {
              privacyLink = href;
              this.updateStatus(`Found Privacy link by keyword:<br><a href="${privacyLink}" target="_blank" style="color: #4CAF50;">${privacyLink}</a>`);
            }
          }
        }
        
        const result = {
          tos: { found: tosLink !== null, url: tosLink, content: null },
          privacy: { found: privacyLink !== null, url: privacyLink, content: null }
        };
        
        // Download ToS if found
        if (tosLink) {
          this.updateStatus(`<h3>Legal Documents Found:</h3>
                            <p>Terms of Use: <span style="color: #4CAF50;">Found ✓</span><br>
                            <a href="${tosLink}" target="_blank" style="color: #4CAF50; word-break: break-all;">${tosLink}</a></p>`);
                            
          try {
            const tosContent = await this.downloadFromLink(tosLink);
            result.tos.content = tosContent;
            this.updateStatus(`<h3>Legal Documents Downloaded:</h3>
                              <p>Terms of Use: <span style="color: #4CAF50;">Downloaded ✓</span><br>
                              <a href="${tosLink}" target="_blank" style="color: #4CAF50; word-break: break-all;">${tosLink}</a><br>
                              Size: ${tosContent ? tosContent.length : 0} characters</p>`);
          } catch (error) {
            this.updateStatus(`<h3>Legal Documents Error:</h3>
                              <p>Terms of Use: <span style="color: #f44336;">Download failed ✗</span><br>
                              <a href="${tosLink}" target="_blank" style="color: #4CAF50; word-break: break-all;">${tosLink}</a><br>
                              Error: ${error.message}</p>`);
          }
        }
        
        // Download Privacy Policy if found
        if (privacyLink) {
          const currentHTML = this.contentDiv.innerHTML;
          this.updateStatus(`${currentHTML}
                            <p>Privacy Policy: <span style="color: #4CAF50;">Found ✓</span><br>
                            <a href="${privacyLink}" target="_blank" style="color: #4CAF50; word-break: break-all;">${privacyLink}</a></p>`);
          
          try {
            const privacyContent = await this.downloadFromLink(privacyLink);
            result.privacy.content = privacyContent;
            const updatedHTML = this.contentDiv.innerHTML.replace(
              `Privacy Policy: <span style="color: #4CAF50;">Found ✓</span>`,
              `Privacy Policy: <span style="color: #4CAF50;">Downloaded ✓</span>`
            );
            this.updateStatus(`${updatedHTML}<br>Size: ${privacyContent ? privacyContent.length : 0} characters`);
          } catch (error) {
            const updatedHTML = this.contentDiv.innerHTML.replace(
              `Privacy Policy: <span style="color: #4CAF50;">Found ✓</span>`,
              `Privacy Policy: <span style="color: #f44336;">Download failed ✗</span>`
            );
            this.updateStatus(`${updatedHTML}<br>Error: ${error.message}`);
          }
        }
        
        // Create download buttons if content was found
        let downloadButtonsHTML = "<h3>Download Options:</h3>";
        
        if (result.tos.content) {
          this.saveToFile("terms_of_use.html", result.tos.content);
        }
        
        if (result.privacy.content) {
          this.saveToFile("privacy_policy.html", result.privacy.content);
        }
        
        return result;
      } catch (error) {
        this.updateStatus(`<h3>Error:</h3><p>${error.message}</p>`);
        console.error("Error in detectAndDownload:", error);
        return { 
          tos: { found: false, url: null, content: null },
          privacy: { found: false, url: null, content: null },
          error: error.message
        };
      }
    }
    
    async downloadFromLink(url) {
      try {
        // Handle CORS issues with a more robust approach
        let content;
        
        try {
          // First try direct fetch
          const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml'
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
          }
          
          content = await response.text();
        } catch (fetchError) {
          console.error(`Direct fetch failed: ${fetchError.message}`);
          
          // As a fallback, create a "proxy" download by opening the link
          content = `
            <html>
              <head>
                <title>Download from ${url}</title>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; }
                  .alert { background: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0; }
                </style>
              </head>
              <body>
                <h1>Legal Document Download</h1>
                <div class="alert">
                  <p>The document couldn't be downloaded directly due to browser security restrictions.</p>
                  <p>Please download it from the original link:</p>
                  <p><a href="${url}" target="_blank">${url}</a></p>
                </div>
              </body>
            </html>
          `;
        }
        
        return content;
      } catch (error) {
        console.error(`Error downloading from ${url}:`, error);
        throw error;
      }
    }
    
    saveToFile(filename, content) {
      // Create download link
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Create visible download button
      const downloadBtn = document.createElement('a');
      downloadBtn.href = url;
      downloadBtn.download = filename;
      downloadBtn.textContent = `Download ${filename}`;
      downloadBtn.style.display = 'block';
      downloadBtn.style.margin = '10px 0';
      downloadBtn.style.padding = '8px 12px';
      downloadBtn.style.background = '#4CAF50';
      downloadBtn.style.color = 'white';
      downloadBtn.style.textDecoration = 'none';
      downloadBtn.style.borderRadius = '4px';
      downloadBtn.style.textAlign = 'center';
      downloadBtn.style.cursor = 'pointer';
      downloadBtn.style.fontWeight = 'bold';
      downloadBtn.style.wordBreak = 'break-word';
      
      // Add to status panel
      this.contentDiv.appendChild(downloadBtn);
      
      console.log(`Download ready for ${filename} - ${content.length} characters`);
    }
  }
  
  // Run this function to test - wrapped in an async IIFE for proper await usage
  (async function executeTest() {
    try {
      console.log("Starting test execution");
      const detector = new LegalDocDetector();
      
      setTimeout(async () => {
        const result = await detector.detectAndDownload();
        console.log("Final result:", result);
      }, 500); // Small delay to ensure UI is rendered
      
    } catch (error) {
      console.error("Test execution error:", error);
      return { error: error.message };
    }
  })();
  