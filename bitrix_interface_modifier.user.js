// ==UserScript==
// @name         Bitrix24: перенос выбранных пунктов меню в футер
// @namespace    http://tampermonkey.net/
// @version      0.1.001
// @description  Переносит указанные пункты левого меню в футер, фиксирует футер и делает его прозрачным
// @author       AlphaCNC01
// @match        *://*.bitrix24.com/*
// @match        *://*.bitrix24.ru/*
// @match        *://*.bitrix24.by/*
// @match        *://*.bitrix24.kz/*
// @match        *://*.bitrix24.eu/*
// @match        *://*.bitrix24.de/*
// @match        *://*.bitrix24.fr/*
// @match        *://*.bitrix24.it/*
// @match        *://*.bitrix24.pl/*
// @match        *://*.bitrix24.uk/*
// @match        *://*.bitrix24.es/*
// @match        *://*.bitrix24.cn/*
// @match        *://*.bitrix24.in/*
// @match        *://*.bitrix24.jp/*
// @match        *://*.bitrix24.com.tr/*
// @match        *://*.bitrix24.vn/*
// @match        *://*.bitrix24.id/*
// @match        *://*.bitrix24.com.br/*
// @grant        none
// @run-at       document-idle
// @downloadURL  https://github.com/AlphaCNC01/bitrix_interface_modifier/raw/refs/heads/main/bitrix_interface_modifier.user.js
// @updateURL    https://github.com/AlphaCNC01/bitrix_interface_modifier/raw/refs/heads/main/bitrix_interface_modifier.user.js
// ==/UserScript==

(function() {
    'use strict';

    // █████████████████████████████████████████████████████████████████████
    // НАСТРОЙКИ – добавьте сюда ID любых пунктов меню, которые хотите перенести
    const MENU_ITEM_IDS = [
        'bx_left_menu_menu_crm_favorite',   // CRM
        'bx_left_menu_menu_crm_store',      // Складской учёт
        'bx_left_menu_menu_tasks'           // Задачи и проекты
        // добавьте новые ID через запятую, например:
        // 'bx_left_menu_menu_booking',      // Онлайн-запись
        // 'bx_left_menu_menu_company'       // Сотрудники
    ];
    // █████████████████████████████████████████████████████████████████████

    // --- Функция переноса одного пункта ---
    function moveMenuItemToFooter(itemId) {
        const menuItem = document.getElementById(itemId);
        if (!menuItem) return; // пункт не найден (возможно, уже удалён)

        // Проверяем, не перенесли ли мы его уже (по data-атрибуту в футере)
        if (document.querySelector(`.air-footer__link[data-source-id="${itemId}"]`)) {
            return; // уже есть в футере
        }

        const link = menuItem.querySelector('a.menu-item-link');
        if (!link) return;

        const href = link.getAttribute('href');
        const text = link.querySelector('.menu-item-link-text')?.textContent.trim() || 'Пункт';

        // Удаляем оригинальный пункт из меню
        menuItem.remove();

        // Находим или создаём контейнер для ссылок в футере
        const footer = document.querySelector('footer.app__footer');
        if (!footer) return;

        let linksContainer = footer.querySelector('.air-footer__links');
        if (!linksContainer) {
            linksContainer = document.createElement('div');
            linksContainer.className = 'air-footer__links';
            const airFooter = footer.querySelector('.air-footer');
            if (airFooter) {
                airFooter.appendChild(linksContainer);
            } else {
                footer.appendChild(linksContainer);
            }
        }

        // Создаём ссылку и помечаем её data-атрибутом с исходным ID
        const newLink = document.createElement('a');
        newLink.href = href;
        newLink.className = 'air-footer__link';
        newLink.textContent = text;
        newLink.target = '_top';
        newLink.setAttribute('data-source-id', itemId);
        linksContainer.appendChild(newLink);
    }

    // --- Применяем стили для футера (прозрачный, фиксированный) ---
    function addStickyFooterStyles() {
        const style = document.createElement('style');
        style.textContent = `
            footer.app__footer {
                position: sticky !important;
                bottom: 0 !important;
                width: 100% !important;
                z-index: 1000 !important;
                /* Затемнённый фон: чёрный с прозрачностью 0.7 */
                background: rgba(0, 0, 0, 0.7) !important;
                /* Лёгкая тень сверху */
                box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.3) !important;
                /* Цвет текста лучше сделать белым или светлым для контраста */
                color: #fff !important;
            }
            footer.app__footer .air-footer {
                background: transparent !important;
            }
        `;
        document.head.appendChild(style);
    }

    // --- Наблюдатель за скрытием футера (удаляем класс --hidden) ---
    function observeFooter() {
        const footer = document.querySelector('footer.app__footer');
        if (!footer) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (footer.classList.contains('--hidden')) {
                        footer.classList.remove('--hidden');
                    }
                }
            });
        });

        observer.observe(footer, { attributes: true });
    }

    // --- Запуск: переносим все пункты из списка ---
    function init() {
        // Сначала добавляем стили и наблюдатель
        addStickyFooterStyles();
        observeFooter();

        // Переносим каждый пункт из массива
        MENU_ITEM_IDS.forEach(id => moveMenuItemToFooter(id));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

