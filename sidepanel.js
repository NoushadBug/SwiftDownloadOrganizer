document.addEventListener('DOMContentLoaded', () => {
  // DOM elements for rules and sidebar
  const rulesTableBody = document.getElementById('rulesTableBody');
  const ruleForm = document.getElementById('ruleForm');
  const closeSidebarButton = document.getElementById('closeSidebar');
  const searchInput = document.getElementById('tableSearch');
  const extensionSelect = document.getElementById('extensionSelect');
  const manageGroupsBtn = document.getElementById('manageGroupsBtn');

  // Manage Groups Modal & its container
  const manageGroupsModal = document.getElementById('manageGroupsModal');
  const groupsContainer = document.getElementById('groupsContainer');

  // "Add Group" Sub-Modal elements
  const openAddGroupModalBtn = document.getElementById('openAddGroupModalBtn');
  const modalAddGroup = document.getElementById('modalAddGroup');
  const modalAddGroupName = document.getElementById('modalAddGroupName');
  const cancelAddGroup = document.getElementById('cancelAddGroup');
  const saveAddGroup = document.getElementById('saveAddGroup');

  // "Add Extension" Sub-Modal (for a specific group)
  const modalAddExtension = document.getElementById('modalAddExtension');
  const modalAddExtensionGroupName = document.getElementById('modalAddExtensionGroupName');
  const modalAddExtensionValue = document.getElementById('modalAddExtensionValue');
  const cancelAddExtension = document.getElementById('cancelAddExtension');
  const saveAddExtension = document.getElementById('saveAddExtension');

  // "Rename Group" Sub-Modal elements
  const modalRenameGroup = document.getElementById('modalRenameGroup');
  const modalRenameGroupInput = document.getElementById('modalRenameGroupInput');
  const cancelRenameGroup = document.getElementById('cancelRenameGroup');
  const saveRenameGroup = document.getElementById('saveRenameGroup');

  // "Rename Extension" Sub-Modal elements
  const modalRenameExtension = document.getElementById('modalRenameExtension');
  const modalRenameExtensionInput = document.getElementById('modalRenameExtensionInput');
  const cancelRenameExtension = document.getElementById('cancelRenameExtension');
  const saveRenameExtension = document.getElementById('saveRenameExtension');

  // "Confirm Delete" Sub-Modal elements
  const modalConfirmDelete = document.getElementById('modalConfirmDelete');
  const modalConfirmDeleteTitle = document.getElementById('modalConfirmDeleteTitle');
  const modalConfirmDeleteMessage = document.getElementById('modalConfirmDeleteMessage');
  const cancelConfirmDelete = document.getElementById('cancelConfirmDelete');
  const saveConfirmDelete = document.getElementById('saveConfirmDelete');

  function filterTable() {
    const filterValue = searchInput.value.toLowerCase();
    Array.from(rulesTableBody.getElementsByTagName('tr')).forEach(row => {
      const cells = row.getElementsByTagName('td');
      const rowMatches = Array.from(cells).some(cell => cell.textContent.toLowerCase().includes(filterValue));
      row.style.display = rowMatches ? '' : 'none';
    });
  }

  searchInput.addEventListener('input', filterTable);


  document.getElementById('openAddRuleModal').addEventListener('click', () => {
    document.getElementById('addRuleModal').classList.remove('hidden');
  });

  document.getElementById('closeAddRuleModal').addEventListener('click', () => {
    document.getElementById('addRuleModal').classList.add('hidden');
  });

  // Inside DOMContentLoaded event listener

  // When the Add Rule Modal is opened, auto-fill the source URL with the active tab URL
  document.getElementById('openAddRuleModal').addEventListener('click', () => {
    document.getElementById('addRuleModal').classList.remove('hidden');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].url) {
        document.getElementById('sourceUrlContains').value = tabs[0].url;
      }
    });
  });

  // Button to manually fetch the active tab URL and insert it into the source URL field
  document.getElementById('fetchActiveTabUrl').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].url) {
        document.getElementById('sourceUrlContains').value = tabs[0].url;
      }
    });
  });



  // Expanded default extension groups
  const defaultExtensionGroups = {
    "Images": [
      "jpg", "jpeg", "png", "gif", "bmp", "tiff", "tif", "svg", "webp", "raw", "heic", "ico", "psd", "ai"
    ],
    "Videos": [
      "mp4", "mkv", "avi", "mov", "wmv", "flv", "webm", "mpeg", "mpg", "m4v", "3gp", "3g2", "m2ts"
    ],
    "Audio": [
      "mp3", "wav", "aac", "ogg", "flac", "m4a", "wma", "aiff", "alac", "amr", "mka"
    ],
    "Documents": [
      "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "rtf", "odt", "ods", "odp", "csv", "md", "tex", "log"
    ],
    "Compressed": [
      "zip", "rar", "7z", "tar", "gz", "bz2", "xz", "iso", "cab", "lz", "ar", "cpio"
    ],
    "Executables": [
      "exe", "msi", "bat", "sh", "apk", "app", "bin", "cmd", "deb", "rpm"
    ],
    "Source Code": [
      // Web & Script Languages
      "js", "ts", "coffee",
      // Scripting & General-purpose Languages
      "py", "rb", "pl", "php", "lua", "groovy", "r",
      // Compiled Languages
      "c", "cpp", "cs", "java", "go", "swift", "kt", "m", "mm",
      // Markup and Data Languages
      "html", "css", "scss", "xml", "json", "yaml", "yml",
      // Functional / Modern Languages
      "rs", "clj", "cljs", "elixir", "ex", "exs",
      // Others
      "vb", "vbnet", "f", "fortran", "erl", "hs", "scala", "dart", "sh", "ps1"
    ],
    "Ebooks": [
      "epub", "mobi", "azw", "azw3", "fb2", "djvu", "ibooks"
    ],
    "CAD": [
      "dwg", "dxf", "iges", "step", "stp", "catpart", "catproduct", "prt", "sldprt"
    ],
    "Virtualization": [
      "vmdk", "vhd", "vhdx", "ova", "ovf"
    ],
    "Database": [
      "db", "sql", "mdb", "accdb", "sqlite", "dbf"
    ],
    "Miscellaneous": [
      "dat", "bak", "tmp", "cfg", "ini", "torrent", "log"
    ]
  };
  let extensionGroups = {};

  // Utility: show/hide modals
  function showModal(el) {
    el.classList.remove('hidden');
  }
  function hideModal(el) {
    el.classList.add('hidden');
  }

  // Load extension groups from storage (or use defaults)
  function loadExtensionGroups(callback) {
    chrome.storage.sync.get({ extensionGroups: defaultExtensionGroups }, (data) => {
      extensionGroups = data.extensionGroups;
      console.log("Loaded extension groups:", extensionGroups);
      if (callback) callback();
    });
  }
  // Save extension groups to storage
  function saveExtensionGroups(callback) {
    chrome.storage.sync.set({ extensionGroups }, callback);
  }

  // Populate the "Add New Rule" dropdown from extension groups
  function populateExtensionDropdown() {
    if (!extensionSelect) return;
    console.log("Populating dropdown with:", extensionGroups);
    extensionSelect.innerHTML = '<option value="">-- Select extension or group --</option>';
    for (const group in extensionGroups) {
      // Option to select the whole group
      const groupOption = document.createElement('option');
      groupOption.value = "group:" + group;
      groupOption.textContent = group + " (All)";
      extensionSelect.appendChild(groupOption);
      // Create an optgroup for individual extensions
      const optgroup = document.createElement('optgroup');
      optgroup.label = group;
      extensionGroups[group].forEach(ext => {
        const option = document.createElement('option');
        option.value = ext;
        option.textContent = ext;
        optgroup.appendChild(option);
      });
      extensionSelect.appendChild(optgroup);
    }
  }

  // Populate the group select for the "Add Extension" sub-modal
  function populateExtensionGroupSelect() {
    const extensionGroupSelect = document.getElementById('extensionGroupSelect');
    if (!extensionGroupSelect) return;
    extensionGroupSelect.innerHTML = '<option value="">-- Select a group --</option>';
    Object.keys(extensionGroups).forEach(group => {
      const option = document.createElement('option');
      option.value = group;
      option.textContent = group;
      extensionGroupSelect.appendChild(option);
    });
  }

  // Build the Manage Groups UI inside the Manage Groups modal
  function buildManageGroupsUI() {
    groupsContainer.innerHTML = '';
    Object.keys(extensionGroups).forEach((groupName) => {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'border p-2 rounded mb-2';

      const headerDiv = document.createElement('div');
      headerDiv.className = 'flex justify-between items-center';

      const nameSpan = document.createElement('span');
      nameSpan.textContent = groupName;
      nameSpan.className = 'font-bold';
      headerDiv.appendChild(nameSpan);

      const actionsDiv = document.createElement('div');

      // Rename Group button
      const renameBtn = document.createElement('button');
      renameBtn.className = 'text-blue-600 hover:text-blue-800 mr-2';
      renameBtn.innerHTML = `<i class="bx bx-edit-alt"></i>`;
      renameBtn.title = 'Rename Group';
      renameBtn.addEventListener('click', () => {
        modalRenameGroupInput.value = groupName;
        showModal(modalRenameGroup);
        saveRenameGroup.onclick = () => {
          const newName = modalRenameGroupInput.value.trim();
          if (newName && newName !== groupName) {
            extensionGroups[newName] = extensionGroups[groupName];
            delete extensionGroups[groupName];
            saveExtensionGroups(() => {
              hideModal(modalRenameGroup);
              buildManageGroupsUI();
              populateExtensionDropdown();
              populateExtensionGroupSelect();
            });
          } else {
            hideModal(modalRenameGroup);
          }
        };
      });
      actionsDiv.appendChild(renameBtn);

      // Delete Group button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'text-red-600 hover:text-red-800 mr-2';
      deleteBtn.innerHTML = `<i class="bx bx-trash"></i>`;
      deleteBtn.title = 'Delete Group';
      deleteBtn.addEventListener('click', () => {
        modalConfirmDeleteTitle.textContent = 'Delete Group?';
        modalConfirmDeleteMessage.textContent = `Delete group "${groupName}" and all its extensions?`;
        showModal(modalConfirmDelete);
        saveConfirmDelete.onclick = () => {
          delete extensionGroups[groupName];
          saveExtensionGroups(() => {
            hideModal(modalConfirmDelete);
            buildManageGroupsUI();
            populateExtensionDropdown();
            populateExtensionGroupSelect();
          });
        };
      });
      actionsDiv.appendChild(deleteBtn);

      // Add Extension button for this group
      const addExtBtn = document.createElement('button');
      addExtBtn.className = 'text-green-600 hover:text-green-800';
      addExtBtn.innerHTML = `<i class="bx bx-plus"></i>`;
      addExtBtn.title = 'Add Extension to this Group';
      addExtBtn.addEventListener('click', () => {
        modalAddExtensionValue.value = '';
        modalAddExtensionGroupName.textContent = groupName;
        showModal(modalAddExtension);
        saveAddExtension.onclick = () => {
          const newExt = modalAddExtensionValue.value.trim();
          if (newExt && !extensionGroups[groupName].includes(newExt)) {
            extensionGroups[groupName].push(newExt);
            saveExtensionGroups(() => {
              hideModal(modalAddExtension);
              buildManageGroupsUI();
              populateExtensionDropdown();
              populateExtensionGroupSelect();
            });
          } else {
            hideModal(modalAddExtension);
          }
        };
      });
      actionsDiv.appendChild(addExtBtn);

      headerDiv.appendChild(actionsDiv);
      groupDiv.appendChild(headerDiv);

      // List extensions for this group
      const ul = document.createElement('ul');
      ul.className = 'ml-4 mt-2';
      extensionGroups[groupName].forEach((ext, idx) => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center';
        li.textContent = ext;
        const extActions = document.createElement('div');
        // Rename Extension button
        const renameExtBtn = document.createElement('button');
        renameExtBtn.className = 'text-blue-600 hover:text-blue-800 mr-2';
        renameExtBtn.innerHTML = `<i class="bx bx-edit-alt"></i>`;
        renameExtBtn.title = 'Rename Extension';
        renameExtBtn.addEventListener('click', () => {
          modalRenameExtensionInput.value = ext;
          showModal(modalRenameExtension);
          saveRenameExtension.onclick = () => {
            const newExt = modalRenameExtensionInput.value.trim();
            if (newExt && newExt !== ext) {
              extensionGroups[groupName][idx] = newExt;
              saveExtensionGroups(() => {
                hideModal(modalRenameExtension);
                buildManageGroupsUI();
                populateExtensionDropdown();
                populateExtensionGroupSelect();
              });
            } else {
              hideModal(modalRenameExtension);
            }
          };
        });
        extActions.appendChild(renameExtBtn);
        // Delete Extension button
        const delExtBtn = document.createElement('button');
        delExtBtn.className = 'text-red-600 hover:text-red-800';
        delExtBtn.innerHTML = `<i class="bx bx-trash"></i>`;
        delExtBtn.title = 'Delete Extension';
        delExtBtn.addEventListener('click', () => {
          modalConfirmDeleteTitle.textContent = 'Delete Extension?';
          modalConfirmDeleteMessage.textContent = `Delete extension "${ext}" from group "${groupName}"?`;
          showModal(modalConfirmDelete);
          saveConfirmDelete.onclick = () => {
            extensionGroups[groupName].splice(idx, 1);
            saveExtensionGroups(() => {
              hideModal(modalConfirmDelete);
              buildManageGroupsUI();
              populateExtensionDropdown();
              populateExtensionGroupSelect();
            });
          };
        });
        extActions.appendChild(delExtBtn);
        li.appendChild(extActions);
        ul.appendChild(li);
      });
      groupDiv.appendChild(ul);
      groupsContainer.appendChild(groupDiv);
    });
  }

  // Manage Groups: when "Manage Groups" button is clicked, load and show modal
  manageGroupsBtn.addEventListener('click', () => {
    loadExtensionGroups(() => {
      buildManageGroupsUI();
      showModal(manageGroupsModal);
    });
  });

  // Close Manage Groups Modal (using its close button)
  document.getElementById('closeManageGroupsBtn').addEventListener('click', () => {
    hideModal(manageGroupsModal);
  });

  // "Add Group" Sub-Modal handling
  openAddGroupModalBtn.addEventListener('click', () => {
    modalAddGroupName.value = '';
    showModal(modalAddGroup);
  });
  cancelAddGroup.addEventListener('click', () => hideModal(modalAddGroup));
  saveAddGroup.addEventListener('click', () => {
    const groupName = modalAddGroupName.value.trim();
    if (groupName && !extensionGroups[groupName]) {
      extensionGroups[groupName] = [];
      saveExtensionGroups(() => {
        hideModal(modalAddGroup);
        buildManageGroupsUI();
        populateExtensionDropdown();
        populateExtensionGroupSelect();
      });
    } else {
      hideModal(modalAddGroup);
    }
  });

  // Load extension groups then populate the "Add New Rule" dropdown
  loadExtensionGroups(() => {
    populateExtensionDropdown();
  });

  // Filter rules table based on search input
  function filterTable() {
    const filterValue = searchInput ? searchInput.value.toLowerCase() : '';
    const rows = rulesTableBody.getElementsByTagName('tr');
    Array.from(rows).forEach(row => {
      const cells = row.getElementsByTagName('td');
      let rowContains = false;
      Array.from(cells).forEach(cell => {
        if (cell.textContent.toLowerCase().includes(filterValue)) {
          rowContains = true;
        }
      });
      row.style.display = rowContains ? '' : 'none';
    });
  }

  // Initialize Sortable for reordering rules using drag handle
  function initSortable() {
    if (window.Sortable) {
      if (window.sortableInstance) window.sortableInstance.destroy();
      window.sortableInstance = Sortable.create(rulesTableBody, {
        animation: 150,
        handle: '.drag-handle',
        onEnd: function () {
          chrome.storage.sync.get({ rules: [] }, (data) => {
            let rules = data.rules || [];
            const newRules = [];
            rulesTableBody.querySelectorAll('tr').forEach(row => {
              const originalIndex = parseInt(row.getAttribute('data-index'));
              if (!isNaN(originalIndex)) newRules.push(rules[originalIndex]);
            });
            newRules.forEach((r, i) => r.precedence = newRules.length - i);
            chrome.storage.sync.set({ rules: newRules }, loadRules);
          });
        }
      });
    }
  }

  // Load and render rules (for "Add New Rule" table)
  function loadRules() {
    chrome.storage.sync.get({ rules: [] }, (data) => {
      let rules = data.rules || [];
      rules.sort((a, b) => (b.precedence || 0) - (a.precedence || 0));
      rulesTableBody.innerHTML = '';
      rules.forEach((rule, index) => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-index', index);
        tr.className = 'odd:bg-white even:bg-gray-100 border-b border-gray-200 hover:bg-gray-50';

        // File Extension cell with drag handle
        const tdFileExt = document.createElement('td');
        tdFileExt.className = 'px-4 py-2';
        const dragHandle = document.createElement('span');
        dragHandle.className = 'drag-handle mr-2 cursor-move';
        dragHandle.innerHTML = `<i class="bx bx-menu"></i>`;
        tdFileExt.appendChild(dragHandle);
        const spanContent = document.createElement('span');
        if (rule.conditions && rule.conditions.extensionGroup) {
          spanContent.innerHTML = `<i class="bx bx-layer mr-2"></i> ${rule.conditions.extensionGroup} (Group)`;
        } else {
          spanContent.textContent = rule.conditions ? (rule.conditions.fileExtension || '') : '';
        }
        tdFileExt.appendChild(spanContent);
        tr.appendChild(tdFileExt);

        // Source URL cell
        const tdSourceUrl = document.createElement('td');
        tdSourceUrl.className = 'px-4 py-2';
        tdSourceUrl.textContent = rule.conditions ? (rule.conditions.sourceUrlContains || '') : '';
        tdSourceUrl.style.display = '-webkit-box';
        tdSourceUrl.style.webkitBoxOrient = 'vertical';
        tdSourceUrl.style.overflow = 'hidden';
        tdSourceUrl.style.textOverflow = 'ellipsis';
        tdSourceUrl.style.width = '100px';
        tr.appendChild(tdSourceUrl);

        // Folder cell with folder icon
        const tdFolder = document.createElement('td');
        tdFolder.className = 'px-4 py-2';
        tdFolder.innerHTML = `<i class="bx bx-folder mr-2"></i>${rule.folder || ''}`;
        tr.appendChild(tdFolder);

        // Actions cell: Edit and Delete buttons
        const tdActions = document.createElement('td');
        tdActions.className = 'px-4 py-2 text-center space-x-2';
        const editBtn = document.createElement('button');
        editBtn.className = 'text-blue-600 hover:text-blue-800 transition text-lg';
        editBtn.innerHTML = `<i class="bx bx-edit-alt"></i>`;
        editBtn.title = 'Edit';
        editBtn.addEventListener('click', () => {
          enterEditMode(tr, rule, index, rules);
        });
        tdActions.appendChild(editBtn);
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'text-red-600 hover:text-red-800 transition text-lg';
        deleteBtn.innerHTML = `<i class="bx bx-trash"></i>`;
        deleteBtn.title = 'Delete';
        deleteBtn.addEventListener('click', () => {
          modalConfirmDeleteTitle.textContent = 'Delete Rule?';
          modalConfirmDeleteMessage.textContent = `Delete this rule?`;
          showModal(modalConfirmDelete);
          saveConfirmDelete.onclick = () => {
            rules.splice(index, 1);
            rules.forEach((r, i) => r.precedence = rules.length - i);
            chrome.storage.sync.set({ rules }, () => {
              hideModal(modalConfirmDelete);
              loadRules();
              filterTable();
            });
          };
        });
        tdActions.appendChild(deleteBtn);
        tr.appendChild(tdActions);

        rulesTableBody.appendChild(tr);
      });
      filterTable();
      initSortable();
    });
  }

  // Inline editing for a rule (using dropdown for extension/group)
  function enterEditMode(tr, rule, index, rules) {
    tr.innerHTML = '';
    const tdFileExt = document.createElement('td');
    tdFileExt.className = 'px-4 py-2';
    const selectExt = document.createElement('select');
    selectExt.className = 'w-full border border-gray-300 rounded px-2 py-1';
    selectExt.innerHTML = '<option value="">-- Select extension or group --</option>';
    for (const group in extensionGroups) {
      const groupOption = document.createElement('option');
      groupOption.value = "group:" + group;
      groupOption.textContent = group + " (All)";
      selectExt.appendChild(groupOption);
      const optgroup = document.createElement('optgroup');
      optgroup.label = group;
      extensionGroups[group].forEach(ext => {
        const option = document.createElement('option');
        option.value = ext;
        option.textContent = ext;
        optgroup.appendChild(option);
      });
      selectExt.appendChild(optgroup);
    }
    if (rule.conditions) {
      if (rule.conditions.extensionGroup) {
        selectExt.value = "group:" + rule.conditions.extensionGroup;
      } else if (rule.conditions.fileExtension) {
        selectExt.value = rule.conditions.fileExtension;
      }
    }
    tdFileExt.appendChild(selectExt);
    tr.appendChild(tdFileExt);

    const tdSourceUrl = document.createElement('td');
    tdSourceUrl.className = 'px-4 py-2';
    const inputSourceUrl = document.createElement('input');
    inputSourceUrl.type = 'text';
    inputSourceUrl.value = rule.conditions ? (rule.conditions.sourceUrlContains || '') : '';
    inputSourceUrl.className = 'w-full border border-gray-300 rounded px-2 py-1';
    tdSourceUrl.appendChild(inputSourceUrl);
    tr.appendChild(tdSourceUrl);

    const tdFolder = document.createElement('td');
    tdFolder.className = 'px-4 py-2';
    const inputFolder = document.createElement('input');
    inputFolder.type = 'text';
    inputFolder.value = rule.folder || '';
    inputFolder.className = 'w-full border border-gray-300 rounded px-2 py-1';
    tdFolder.appendChild(inputFolder);
    tr.appendChild(tdFolder);

    const tdActions = document.createElement('td');
    tdActions.className = 'px-4 py-2 text-center space-x-2';
    const saveBtn = document.createElement('button');
    saveBtn.className = 'text-green-600 hover:text-green-800 transition text-lg';
    saveBtn.innerHTML = `<i class="bx bx-check"></i>`;
    saveBtn.addEventListener('click', () => {
      const extVal = selectExt.value.trim();
      const sourceUrlVal = inputSourceUrl.value.trim();
      const folderVal = inputFolder.value.trim();
      let updatedRule = { folder: folderVal, precedence: rule.precedence || 0 };
      let conditions = {};
      if (extVal) {
        if (extVal.startsWith("group:")) {
          conditions.extensionGroup = extVal.substring(6);
        } else {
          conditions.fileExtension = extVal;
        }
      }
      if (sourceUrlVal) conditions.sourceUrlContains = sourceUrlVal;
      if (Object.keys(conditions).length > 0) updatedRule.conditions = conditions;
      rules[index] = updatedRule;
      rules.sort((a, b) => (b.precedence || 0) - (a.precedence || 0));
      rules.forEach((r, i) => r.precedence = rules.length - i);
      chrome.storage.sync.set({ rules }, () => {
        loadRules();
        filterTable();
      });
    });
    tdActions.appendChild(saveBtn);
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'text-red-600 hover:text-red-800 transition text-lg';
    cancelBtn.innerHTML = `<i class="bx bx-x"></i>`;
    cancelBtn.addEventListener('click', () => {
      loadRules();
      filterTable();
    });
    tdActions.appendChild(cancelBtn);
    tr.appendChild(tdActions);
  }

  // "Add New Rule" form submission
  ruleForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const extensionValue = extensionSelect.value.trim();
    const sourceUrlContains = document.getElementById('sourceUrlContains').value.trim();
    const folder = document.getElementById('folder').value.trim();
    chrome.storage.sync.get({ rules: [] }, (data) => {
      let rules = data.rules || [];
      const precedence = rules.length + 1;
      let newRule = { folder, precedence };
      let conditions = {};
      if (extensionValue) {
        if (extensionValue.startsWith('group:')) {
          conditions.extensionGroup = extensionValue.substring(6);
        } else {
          conditions.fileExtension = extensionValue;
        }
      }
      if (sourceUrlContains) conditions.sourceUrlContains = sourceUrlContains;
      if (Object.keys(conditions).length > 0) newRule.conditions = conditions;
      rules.push(newRule);
      rules.sort((a, b) => (b.precedence || 0) - (a.precedence || 0));
      rules.forEach((r, i) => r.precedence = rules.length - i);
      chrome.storage.sync.set({ rules }, () => {
        ruleForm.reset();
        populateExtensionDropdown();
        loadRules();
        filterTable();
      });
    });
  });

  // Listen for changes in storage (rules)
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes.rules) {
      loadRules();
      filterTable();
    }
  });

  // Close sidebar handler
  closeSidebarButton.addEventListener('click', () => {
    window.close();
  });

  // Initial load of rules
  loadRules();
});
