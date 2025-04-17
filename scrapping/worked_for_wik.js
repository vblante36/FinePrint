class UniversalLegalDocDownloader {
  constructor() {
    // Create a simple status div
    this.statusDiv = document.createElement('div');
    this.statusDiv.style.position = 'fixed';
    this.statusDiv.style.top = '10px';
    this.statusDiv.style.left = '10px';
    this.statusDiv.style.padding = '15px';
    this.statusDiv.style.background = 'rgba(0,0,0,0.8)';
    this.statusDiv.style.color = 'white';
    this.statusDiv.style.zIndex = '9999';
    this.statusDiv.style.borderRadius = '5px';
    this.statusDiv.style.fontFamily = 'Arial, sans-serif';
    this.statusDiv.style.maxWidth = '400px';
    this.statusDiv.style.maxHeight = '80vh';
    this.statusDiv.style.overflowY = 'auto';
    document.body.appendChild(this.statusDiv);
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.right = '5px';
    closeBtn.style.top = '5px';
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.color = 'white';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => this.statusDiv.remove();
    this.statusDiv.appendChild(closeBtn);
    
    // Create content container
    this.contentDiv = document.createElement('div');
    this.statusDiv.appendChild(this.contentDiv);
    
    this.updateStatus("Initializing Universal Document Downloader...");
  }
  
  updateStatus(message) {
    this.contentDiv.innerHTML = message;
    console.log(message);
  }
  
  async detectAndDownload() {
    try {
      this.updateStatus("Scanning for legal documents...");
      
      // Find ToS and Privacy Policy links
      let tosLink = this.findLegalLink(['terms', 'tos', 'conditions', 'terms of service', 'terms of use']);
      let privacyLink = this.findLegalLink(['privacy', 'privacy policy', 'data policy', 'data protection']);
      
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
          // Use multiple methods to try to get the content
          const tosContent = await this.fetchContentWithAllMethods(tosLink);
          result.tos.content = tosContent;
          
          this.updateStatus(`<h3>Legal Documents Downloaded:</h3>
                            <p>Terms of Use: <span style="color: #4CAF50;">Downloaded ✓</span><br>
                            <a href="${tosLink}" target="_blank" style="color: #4CAF50; word-break: break-all;">${tosLink}</a><br>
                            Size: ${tosContent ? tosContent.length : 0} characters</p>`);
          
          // Create download button
          this.saveAsTextFile("terms_of_service.txt", tosContent);
        } catch (error) {
          this.updateStatus(`<h3>Legal Documents Error:</h3>
                            <p>Terms of Use: <span style="color: #f44336;">Download failed ✗</span><br>
                            <a href="${tosLink}" target="_blank" style="color: #4CAF50; word-break: break-all;">${tosLink}</a><br>
                            Error: ${error.message}</p>
                            <p>Please try manual download by opening the link directly.</p>`);
        }
      } else {
        this.updateStatus(`<h3>Legal Documents:</h3><p>Terms of Use: <span style="color: #f44336;">Not found ✗</span></p>`);
      }
      
      // Download Privacy Policy if found
      if (privacyLink) {
        const currentHTML = this.contentDiv.innerHTML;
        this.updateStatus(`${currentHTML}
                          <p>Privacy Policy: <span style="color: #4CAF50;">Found ✓</span><br>
                          <a href="${privacyLink}" target="_blank" style="color: #4CAF50; word-break: break-all;">${privacyLink}</a></p>`);
        
        try {
          // Use multiple methods to try to get the content
          const privacyContent = await this.fetchContentWithAllMethods(privacyLink);
          result.privacy.content = privacyContent;
          
          const updatedHTML = this.contentDiv.innerHTML.replace(
            `Privacy Policy: <span style="color: #4CAF50;">Found ✓</span>`,
            `Privacy Policy: <span style="color: #4CAF50;">Downloaded ✓</span>`
          );
          this.updateStatus(`${updatedHTML}<br>Size: ${privacyContent ? privacyContent.length : 0} characters`);
          
          // Create download button
          this.saveAsTextFile("privacy_policy.txt", privacyContent);
        } catch (error) {
          const updatedHTML = this.contentDiv.innerHTML.replace(
            `Privacy Policy: <span style="color: #4CAF50;">Found ✓</span>`,
            `Privacy Policy: <span style="color: #f44336;">Download failed ✗</span>`
          );
          this.updateStatus(`${updatedHTML}<br>Error: ${error.message}
                            <p>Please try manual download by opening the link directly.</p>`);
        }
      } else {
        const currentHTML = this.contentDiv.innerHTML;
        this.updateStatus(`${currentHTML}<p>Privacy Policy: <span style="color: #f44336;">Not found ✗</span></p>`);
      }
      
      // Add alternate method if both downloads failed
      if ((tosLink && !result.tos.content) || (privacyLink && !result.privacy.content)) {
        this.addManualInstructions();
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
  
  findLegalLink(keywords) {
    // Strategy 1: Check footer links (most common location)
    const footerElements = document.querySelectorAll('footer, .footer, #footer, [id*="footer"], [class*="footer"]');
    for (const footer of footerElements) {
      const links = footer.querySelectorAll('a');
      for (const link of links) {
        const href = link.href || '';
        const text = link.textContent.trim().toLowerCase();
        
        if (keywords.some(keyword => text.includes(keyword) || href.toLowerCase().includes(keyword))) {
          return link.href;
        }
      }
    }
    
    // Strategy 2: Check links at the bottom of the page
    const allLinks = Array.from(document.querySelectorAll('a'));
    // Sort links by their vertical position
    const bottomLinks = allLinks
      .filter(link => link.getBoundingClientRect().top > window.innerHeight * 0.7)
      .sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top);
    
    for (const link of bottomLinks) {
      const href = link.href || '';
      const text = link.textContent.trim().toLowerCase();
      
      if (keywords.some(keyword => text.includes(keyword) || href.toLowerCase().includes(keyword))) {
        return link.href;
      }
    }
    
    // Strategy 3: Check all links with relevant keywords
    for (const link of allLinks) {
      const href = link.href || '';
      const text = link.textContent.trim().toLowerCase();
      
      if (keywords.some(keyword => text.includes(keyword) || href.toLowerCase().includes(keyword))) {
        return link.href;
      }
    }
    
    return null;
  }
  
  async fetchContentWithAllMethods(url) {
    const methods = [
      this.fetchDirect.bind(this),
      this.fetchWithCors.bind(this),
      this.fetchWithProxies.bind(this),
      this.fetchWithIframe.bind(this)
    ];
    
    for (const method of methods) {
      try {
        this.updateStatus(`Trying download method ${methods.indexOf(method) + 1} of ${methods.length}...`);
        const content = await method(url);
        if (content && content.length > 100) { // Basic validation that we got real content
          return content;
        }
      } catch (error) {
        console.warn(`Method ${methods.indexOf(method) + 1} failed:`, error);
        // Continue to the next method
      }
    }
    
    throw new Error("All download methods failed");
  }
  
  // Method 1: Direct fetch
  async fetchDirect(url) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const html = await response.text();
      return this.extractTextFromHTML(html);
    } catch (error) {
      throw new Error(`Direct fetch failed: ${error.message}`);
    }
  }
  
  // Method 2: Fetch with CORS options
  async fetchWithCors(url) {
    // Try different CORS approaches
    const corsOptions = [
      // Option 1: Add origin parameter (works for some APIs)
      async () => {
        const urlWithOrigin = new URL(url);
        urlWithOrigin.searchParams.append('origin', '*');
        
        const response = await fetch(urlWithOrigin.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        
        return response.text();
      },
      
      // Option 2: Try with no-cors mode (limited but sometimes works)
      async () => {
        const response = await fetch(url, {
          method: 'GET',
          mode: 'no-cors',
          headers: {
            'Accept': 'text/html'
          }
        });
        
        // Note: with no-cors, response.text() will likely fail
        // But we try anyway as a fallback
        return response.text();
      }
    ];
    
    for (const option of corsOptions) {
      try {
        const html = await option();
        return this.extractTextFromHTML(html);
      } catch (error) {
        console.warn(`CORS option failed:`, error);
        // Try next option
      }
    }
    
    throw new Error("All CORS options failed");
  }
  
  // Method 3: Use public CORS proxies
  async fetchWithProxies(url) {
    // Try several public CORS proxies
    const corsProxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
      `https://cors-anywhere.herokuapp.com/${url}` // Requires request header
    ];
    
    for (const proxyUrl of corsProxies) {
      try {
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          continue; // Try next proxy
        }
        
        const html = await response.text();
        return this.extractTextFromHTML(html);
      } catch (error) {
        console.warn(`Proxy ${proxyUrl} failed:`, error);
        // Continue to next proxy
      }
    }
    
    throw new Error("All proxy attempts failed");
  }
  
  // Method 4: Try iframe approach for same-origin documents
  async fetchWithIframe(url) {
    return new Promise((resolve, reject) => {
      try {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        iframe.onload = function() {
          try {
            // This will only work for same-origin URLs
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const content = iframeDoc.documentElement.outerHTML;
            document.body.removeChild(iframe);
            resolve(content);
          } catch (e) {
            document.body.removeChild(iframe);
            reject(new Error('Same-origin policy prevented content access'));
          }
        };
        
        iframe.onerror = function() {
          document.body.removeChild(iframe);
          reject(new Error('Iframe failed to load'));
        };
        
        iframe.src = url;
        
        // Set a timeout in case the load event never fires
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
            reject(new Error('Iframe load timeout'));
          }
        }, 10000);
      } catch (e) {
        reject(new Error(`Iframe creation failed: ${e.message}`));
      }
    });
  }
  
  extractTextFromHTML(html) {
    // Create a temporary element to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove script, style, and other non-content elements
    const elementsToRemove = tempDiv.querySelectorAll('script, style, iframe, noscript, meta, link, svg, canvas, video');
    elementsToRemove.forEach(el => el.remove());
    
    // Get the text content
    let text = tempDiv.textContent || tempDiv.innerText;
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  }
  
  saveAsTextFile(filename, text) {
    // Create a blob with the text content
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = filename;
    downloadLink.textContent = `Download ${filename}`;
    downloadLink.style.display = 'block';
    downloadLink.style.margin = '10px 0';
    downloadLink.style.padding = '8px 12px';
    downloadLink.style.background = '#4CAF50';
    downloadLink.style.color = 'white';
    downloadLink.style.borderRadius = '4px';
    downloadLink.style.textDecoration = 'none';
    downloadLink.style.textAlign = 'center';
    downloadLink.style.fontWeight = 'bold';
    downloadLink.style.cursor = 'pointer';
    
    // Add to status div
    this.contentDiv.appendChild(downloadLink);
  }
  
  addManualInstructions() {
    const instructionsDiv = document.createElement('div');
    instructionsDiv.style.marginTop = '20px';
    instructionsDiv.style.padding = '10px';
    instructionsDiv.style.border = '1px solid #f44336';
    instructionsDiv.style.borderRadius = '4px';
    
    instructionsDiv.innerHTML = `
      <h3>Manual Download Instructions</h3>
      <p>If automatic download failed, please try these methods:</p>
      <ol>
        <li>Right-click on the document link above and open in a new tab</li>
        <li>Select all content (Ctrl+A or Cmd+A)</li>
        <li>Copy the content (Ctrl+C or Cmd+C)</li>
        <li>Paste into a text file</li>
      </ol>
      <p>Alternative methods:</p>
      <ol>
        <li>Use a browser extension like "SingleFile" to save the complete page</li>
        <li>Try viewing the page source (right-click > View Page Source)</li>
        <li>Use a command-line tool like wget or curl with the URL</li>
      </ol>
    `;
    
    this.contentDiv.appendChild(instructionsDiv);
  }
}

// Run this function to test
(function() {
  try {
    console.log("Starting legal document downloader");
    const downloader = new UniversalLegalDocDownloader();
    downloader.detectAndDownload();
  } catch (error) {
    console.error("Error running downloader:", error);
  }
})();
