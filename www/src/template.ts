export const template =
`<div class="js-playground v-playground">
  <div class="playground__editor">
    <div class="js-playground__action-run run-style-button">
      <div class="icon">
        <svg class="run-icon" width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_14_12)">
            <path d="M14.0548 8.75068L3.25542 14.9857C2.92209 15.1782 2.50542 14.9376 2.50542 14.5527L2.50542 2.08263C2.50542 1.69774 2.92208 1.45717 3.25542 1.64962L14.0548 7.88465C14.3881 8.0771 14.3881 8.55823 14.0548 8.75068Z"
                  fill="#659360" fill-opacity="0.2" stroke="#659360"/>
          </g>
          <defs>
            <clipPath id="clip0_14_12">
              <rect width="16" height="16" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      </div>
    </div>
    <!-- Place for CodeMirror editor -->
    <textarea></textarea>

    <div class="js-terminal playground__terminal">
      <div class="header">
        <button class="js-terminal__close-buttom terminal__close-button">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect class="close-terminal-button-rect" x="1" y="8" width="13" height="1"/>
          </svg>
        </button>
      </div>
      <pre class="js-terminal__output terminal__output"></pre>
    </div>
  </div>
</div>
`