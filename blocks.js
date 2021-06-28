/**
 * УНИВЕРСАЛЬНЫЕ БЛОКИ.
 */

/**
 * БЛОК "modal-window".
 *
 * Блок предназначен для показа модального (всплывающего) окна.
 *
 * Для правильной работы модального окна необходимо указать атрибут:
 * 		data-bem = '{ "modal-window" : {"name" : "уникальное_имя_модального_окна_для_его_идентификации"}'
 *
 * Если модальное окно расположено внутри блока, который производит работу, то необходимо для управления
 * модальным окном использовать БЭМ-события.
 * Если модальное окно расположено за пределами блока, который производит работу, то необходимо использовать
 * именные каналы.
 *
 * Основные параметры:
 * @param {string} direction auto|top|center|end|fit
 * 		Расположение модального окна по отношению границ окна браузера.
 * 		'auto'- расположение модального окна задаётся автоматически: если модальное окно по высоте ниже окна браузера -
 * 		оно центрируется, если выше - появляется вертикальная полоса прокрутки;
 * 		'top' - располагается сверху;
 * 		'center' - располагается по центру;
 * 		'end' - располагается снизу;
 * 		'fit' - фиксация модального окна по высоте, это достигается путём подсчёта и задания в 'px' высоты элемента "__content",
 * 		а также добавлением модификатора "modal-window_display_fit". Если внутрь элемента "__content" вставляется оболочка,
 * 		внутри которой необходимо показать горизонтальную полосу прокрутки, то ей необходимо задать либо добавить следующие
 * 		стили: {height:100%; overflow-y:auto; overflow-x:hidden;}
 * @param {string} multiple on|off
 * 		Многооконность. Когда можно открывать много окон, а затем их по очереди закрывать.
 */
modules.define('modal-window', ['i-bem-dom', 'events__channels', 'jquery'], function(provide, bemDom, channels, $) {

	provide(bemDom.declBlock(this.name,
	{
		/**
		 * МЕТОДЫ ЭКЗЕМПЛЯРА.
		 */

		/**
		 * Задание параметров по умолчанию.
		 */
		_getDefaultParams: function() {
			return {
				direction: 'auto',
				multiple: 'off',
			}
		},

	    /**
	     * Триггеры до установки модификаторов.
	     */
	    beforeSetMod: {},

		/**
		 * Триггеры после установки модификаторов.
		 */
		onSetMod: {

			'js': {
				// Конструктор экземпляра.
				'inited': function() {

					// Определяем основные свойства всплывающего окна.
					this._propertiesAll();

					// Получаем объекты, с которыми будем работать.
					this._body = $( 'body' );
					this._elem_div_wrap = this.findChildElem( 'wrap' );
					this._elem_div_content = this.findChildElem( 'content' );// Модальное окно.
					this._elem_div_close = this.findChildElem( 'close' );// Иконка закрытия.

					// События.
        			// Следующие два события происходят одновременно, если курсор находится в пределах модального окна.
        			// В этом случае событие 2 происходит перед событием 1, иначе происходит только событие 1 (щелчок вне модального окна).
        			var e = 0;
        			// Событие 2: клик в районе модального окна.
        			this._domEvents( this._elem_div_content ).on( 'click', function( event ) {

            			e = 2;
        			});
        			// Событие 1: клик за пределами модального окна.
        			this._domEvents().on( 'click', function( event ) {

            			if ( e == 1 || e == 0 ) {

            				// Клик за пределами модального окна.
            				this.close();
            			}
						else {

						    // Клик в модальном окне.
						    e = 1;
						}
        			});

        			// Щелчок на иконку закрытия модального окна.
        			if ( this._elem_div_close ) {

        				this._domEvents( this._elem_div_close ).on( 'click', function( event ) {

							this.close();
						});
        			}

					// Именованный канал события на открытия модального окна.
					channels( 'modal-window' ).on( 'openmodal', { mythis: this }, function( event, data ) {

						// Открыть модальное окно возможно только в текущем экземпляре.
						if ( event.data.mythis.params.name == data ) {

							event.data.mythis.open( data );
						}
					});

					// БЭМ-событие на открытие модального окна.
					this._events().on( 'openmodal', { mythis: this }, function( event, data ) {

						// Открыть модальное окно возможно только в текущем экземпляре.
						if ( event.data.mythis.params.name == data ) {

							event.data.mythis.open( data );
						}
					});

					// Именованный канал события на закрытия модального окна.
					channels( 'modal-window' ).on( 'closemodal', { mythis: this }, function( event, data ) {

						if ( event.data.mythis.params.name == data ) {

							event.data.mythis.close();
						}
					});

					// БЭМ-событие на закрытие модального окна.
					this._events().on( 'closemodal', { mythis: this }, function( event, data ) {

						if ( event.data.mythis.params.name == data ) {

							event.data.mythis.close();
						}
					});

					// Размеры окна браузера изменены.
					this._domEvents( bemDom.win ).on( 'resize', { mythis: this }, function( event ) {

						if ( event.data.mythis.__self.modal ) {

							if ( event.data.mythis.__self.namemodal == event.data.mythis.params.name ) {

								if ( event.data.mythis.close() ) {

									event.data.mythis.open( event.data.mythis.__self.namemodal );
								}
							}
						}
					});
				}
			}
		},

		/**
		 * Определяет основные свойства всплывающего окна.
		 */
		_propertiesAll: function() {

			// Высота окна браузера.
			this._winH = document.documentElement.clientHeight;
			// Высота всего документа с учетом прокрутки (для всех браузеров), включая его невидимую часть (если такая область имеется).
			this._bodyH = Math.max(
			    document.body.scrollHeight,
			    document.documentElement.scrollHeight,
			    document.body.offsetHeight,
			    document.documentElement.offsetHeight,
			    document.body.clientHeight,
			    document.documentElement.clientHeight
			);
			// Высота невидимой верхней части страницы (для всех браузеров).
			this._scrollTop = window.pageYOffset || document.documentElement.scrollTop;
			// Ширина окна браузера исключая прокрутку.
			this._winW = document.documentElement.clientWidth;
		},

		/**
		 * Открывает модальное окно.
		 *
		 * @param {string} data
		 * 		Имя модального окна, которое пользователь передал через именной канал.
		 */
    	open: function( data ) {

			// Получаем свойства окна браузера.
			this._propertiesAll();
			// Если модальное окно открывается впервые.
			if ( !this.__self.modal ) {

				this._open( data );
			}
			// Если модальное окно уже открыто.
			else if ( this.__self.modal ) {

				// Если необходимо закрыть окно не из текущего экземпляра.
				if ( this.__self.namemodal != data ) {

					channels( 'modal-window' ).emit( 'closemodal', this.__self.namemodal );
					this._open( data );
				}
				else {

					if ( this.close() ) {

						this._open( data );
					}
				}
			}
    	},

    	/**
		 * Добавляет модификатор к блоку, в результате чего появляется модальное окно.
		 *
		 * @param {string} data
		 * 		Имя модального окна, которое пользователь передал через именной канал.
		 */
		_open: function( data ) {

			// Чтобы не показывалась дополнительная полоса прокрутки у браузера.
			this._body.css( 'overflow', 'hidden' );
			// Предварительно показываем окно для определения его размера.
			if ( this.hasMod( 'hide' ) ) {

				if ( this.params.direction == 'fit' ) {

					this.delMod( 'hide' );
					this.setMod( 'display', 'top' );
					let h__wrap = this._elem_div_wrap.domElem.height();
					let h__content = this._elem_div_content.domElem.height();
					let new_h = Math.floor( this._winH - ( h__wrap - h__content ) );
					this._elem_div_content.domElem.height( new_h );
					this.delMod( 'display', 'top' );
					this.setMod( 'display', 'fit' );
				}
				else {

					this.delMod( 'hide' );
					this.setMod( 'display', 'top' );
				}
			}
			if ( this.params.direction == 'center' || this.params.direction == 'auto' ) {

				// В зависимости от размера окна.
				if ( this._resize() ) {

					this.delMod( 'display', 'top' );
					this.setMod( 'display', 'center' );
				}
			}
			if ( this.params.direction == 'bottom' ) {

				if ( this._resize() ) {

					this.delMod( 'display', 'top' );
					this.setMod( 'display', 'bottom' );
				}
			}
			
			// Указываем, что модальное окно успешно открыто.
			this.__self.modal = true;
			this.__self.namemodal = data;
		},

		/**
		 * Возвращает строку, содержащую "true" или "false", в зависимости от размера модального окна.
		 * Метод следует использовать только после отображения модального окна.
		 *
		 * @return {bool} true|false
		 * 		true - высота модального окна ниже окна браузера, false - высота модального окна выше окна браузера.
		 */
    	_resize: function() {

			this._propertiesAll();
			// После отображения модального окна можно определить его высоту.
			let modalH = this._elem_div_content.domElem.height();
			// Если модальное окно по высоте ниже окна браузера.
			if ( modalH < this._winH ) {

				return true;
			}
			else {

				return false;
			}
    	},

		/**
		 * Закрывает модальное окно.
		 */
		close: function() {

			if ( !this.hasMod( 'hide' ) ) {

        		this.setMod( 'hide' );
        		this._body.removeAttr( 'style' );
    		}
    		this.__self.modal = false;
			channels( 'modal-window' ).emit( 'closemodal' );

			return true;
		},
	},
	{
		/**
		 * Cтатические методы.
		 */

	    /**
	     * Указывает открыто или закрыто модальное окно.
	     */
	    modal: false,

	    /**
	     * Имя модального окна.
	     */
	    namemodal: null,
	}
));

});

/**
 * БЛОК "paste".
 * 
 * Блок предназначен для вставки внутрь себя html вёрcтки.

 * Внутри блока могут располагаться дополнительные элементы: `paste__trubber`, `paste__other`, `paste__delete`. Код самостоятельно
 * определит нахождение или отсутствие элементов, указывать дополнительно отсутствие или нахождение дополнительных элементов не требуется.
 *
 * Для вставки html-кода необходимо к блоку или элементу добавить класс (примиксовать класс) `paste i-bem`. Далее указать необходимые
 * параметры блока `data-bem = '{ "paste":{} }'`.
 *
 * Основные параметры:
 *
 * @param {string} channel
 *		Имя канала через который будут передаваться данные для вставки. В качестве имени канала рекомендуется выбирать имя блока, отправляющего данные - разметку html.
 * @param {object} init
 *		Стартовый режим "init". Содержит порядок отображения дополнительных элементов.
 * @param {object} wait
 * 		Режим ожидания "wait". Содержит порядок отображения дополнительных элементов.
 * @param {object} insert
 * 		Режим вставки "insert". Содержит порядок отображения дополнительных элементов.
 * @param {object} insert
 *		Режим сброса "reset". Содержит порядок отображения дополнительных элементов.
 *
 * Порядок отображения дополнительных элементов блока `paste` задаётся с помощью режимов (mode). Всего есть 4 режима.
 * 		`init` - стартовый режим;
 * 		`wait` - режим ожидания;
 * 		`insert` - режим вставки;
 * 		`reset` - режим сброса.
 *
 * Пример "чистого" шаблона:
 *
 * <div class="paste i-bem" data-bem='{ "paste" : {"channel":"mychannel","init":{"other":true}} }'>
 * 		<div class="paste__trubber paste__trubber_hide">...</div>
 *		<div class="paste__other paste__other_hide">...</div>
 *		<div class="paste__delete paste__delete_hide">...</div>
 * </div>
 *
 * Обратите внимание, что у каждого элемента указан модификатор `hide`, его необходимо указывать обязательно.
 *
 * Пример событий:
 *
 * // Режим ожидания:
 * channels( 'text-new-messages' ).emit( 'wait' );
 * // Режим вставки:
 * channels( 'text-new-messages' ).emit( 'insert', html );
 * // Стартовый режим:
 * channels( 'text-new-messages' ).emit( 'init' );
 * // Режим сброса:
 * channels( 'text-new-messages' ).emit( 'reset' );
 *
 * Вышеприведенный команды с режимами рекомендуется указывать в коде содержащий AJAX-запрос.
 *
 * Три вышеуказанных режима занимаются отправкой команды из именного канала и установкой элементов cогласно настройкам параметров.
 * Режим (insert) вставляет данные, заменяя элемент "delete" переданными данными. Поэтому у данного режима есть второй аргумент,
 * содержащий данные для вставки. В добавок к режиму вставки данных (insert), по этому же именному каналу, возвращается команда (insertend),
 * говорящяя об успешной вставки данных. Рекомендуется только после возвращения данной команды производить какие-либо действия
 * над вставленными данными.
 *
 * Существует возможность изменять любой режим при помощи настроек параметров блока "paste". Для этого в атрибуте "data-bem"
 * необходимо указать режим и его новые значения. ВНИМАНИЕ! При изменение режима необходимо указывать все новые значения,
 * даже если часть из них не изменяется:
 * 		data-bem = '{ "paste":{"reset":{ "trubber": true, "other": true, "delete": false }} }'
 */
modules.define('paste', ['i-bem-dom', 'events__channels', 'jquery'], function(provide, bemDom, channels, $) {

provide(bemDom.declBlock(this.name,
	{
		/**
		 * МЕТОДЫ ЭКЗЕМПЛЯРА.
		 */

		/**
		 * Задание параметров по умолчанию.
		 */
		_getDefaultParams: function() {

			return {

				channel: null,
				init: {

					trubber: false,
					other: true,
					delete: false,
				},
				wait: {

					trubber: true,
					other: false,
					delete: false,
				},
				insert: {

					trubber: false,
					other: false,
					delete: true,
				},
				reset: {

				  trubber: false,
				  other: false,
				  delete: false,
				},
			}
		},

		/**
		 * Триггеры до установки модификаторов.
		 */
		beforeSetMod: {},

		/**
		 * Триггеры после установки модификаторов.
		 */
		onSetMod: {

			'js': {
				// Конструктор экземпляра.
				'inited': function() {

					// Устанавливаем первоначальный режим.
					this._setupElem( 'init' );

					// События.
					if ( this.params.channel ) {

						// Именной канал на ожидание вставки html-кода.
						channels( this.params.channel ).on( 'wait', { mythis: this }, function( event ) {
							
							event.data.mythis._setupElem( 'wait' );
						});
						// Именной канал на вставку нового html-кода.
						channels( this.params.channel ).on( 'insert', { mythis: this }, function( event, html ) {
							
							event.data.mythis._insert( html );
						});
						// Именной канал на запуск первоначального режима.
						channels( this.params.channel ).on( 'init', { mythis: this }, function( event, html ) {
							
							event.data.mythis._setupElem( 'init' );
						});
						// Именной канал на режим сброса.
						channels( this.params.channel ).on( 'reset', { mythis: this }, function( event, html ) {
							
							event.data.mythis._setupElem( 'reset' );
						});
					}

				}
			}
		},

		/**
		 * Устанавливает режимы отображения элементов "trubber", "other", "delete".
		 *
		 * @param {mode} mode init|wait|insert|reset
		 *    Режимы отображения элементов "trubber", "other", "delete" согласно заданным параметрам.
		 */
		_setupElem: function( mode ) {

			let object_param = null;
			// Выбираем режим.
			switch( mode ) {

				case 'init':
					object_param = this.params.init;
					break;
				case 'wait':
					object_param = this.params.wait;
					break;
				case 'insert':
					object_param = this.params.insert;
					break;
				case 'reset':
					object_param = this.params.reset;
					break;
			}
			let _trubber = this.findChildElem( 'trubber' );
			if ( object_param.trubber && _trubber ) {
				
				_trubber.delMod( 'hide' );
			}
			if ( !object_param.trubber && _trubber ) {
				
				_trubber.setMod( 'hide' );
			}
			let _other = this.findChildElem( 'other' );
			if ( object_param.other && _other ) {

				_other.delMod( 'hide' );
			}
			if ( !object_param.other && _other ) {
				
				_other.setMod( 'hide' );
			}
			let _delete = this.findChildElems( 'delete' );
			if ( object_param.delete && _delete ) {
				
				_delete.delMod( 'hide' );
			}
			if ( !object_param.delete && _delete ) {
				
				_delete.setMod( 'hide' );
			}
		},

		/**
		 * Вставка html-разметки с заменой элемента(-ов) "paste__delete" внутри блока.
		 *
		 * @param {string} html
		 *    Строка, содержащая html разметку.
		 */
		_insert: function( html ) {
			
			this._delete = this.findChildElems( 'delete' );
			if ( this._delete.size() > 0 ) {
				
				let i = 1;
				this._delete.forEach( function( object ) {
					
					if ( i == 1) {
						
						bemDom.replace( object.domElem, html );
						i++;
					}
					else {
						
						bemDom.destruct( object.domElem );
					}
				});
				if ( this.params.channel ) {
					
					channels( this.params.channel ).emit( 'insertend' );
				}
			}
			this._setupElem( 'insert' );
		},

	},
	{
		/**
		 * СТАТИЧЕСКИЕ МЕТОДЫ.
		 */
	}

));

});

/**
 * БЛОК "paste2".
 */
modules.define('paste2', ['i-bem-dom', 'paste', 'events__channels', 'jquery'], function(provide, bemDom, paste, channels, $) {

provide(bemDom.declBlock(this.name, paste, {}, {} ));

});

/**
 * БЛОК "paste3".
 */
modules.define('paste3', ['i-bem-dom', 'paste', 'events__channels', 'jquery'], function(provide, bemDom, paste, channels, $) {

provide(bemDom.declBlock(this.name, paste, {}, {} ));

});

/**
 * БЛОК "paste4".
 */
modules.define('paste4', ['i-bem-dom', 'paste', 'events__channels', 'jquery'], function(provide, bemDom, paste, channels, $) {

provide(bemDom.declBlock(this.name, paste, {}, {} ));

});

/**
 * БЛОК "paste5".
 */
modules.define('paste5', ['i-bem-dom', 'paste', 'events__channels', 'jquery'], function(provide, bemDom, paste, channels, $) {

provide(bemDom.declBlock(this.name, paste, {}, {} ));

});

/**
 * БЛОК "paginator".
 * 
 * Основные параметры:
 *
 * @param {string} channel1
 *		Имя канала блока "paste", к которому будет привязан пагинатор.
 * @param {string} channel2
 *		Имя канала блока "paste", к которому не привязан пагинатор.
 * @param {string} autopaginator
 *		Включает или отключает автопагинацию:
 * 			"null" - автопагинация отключена;
 * 			"top" - автопагинация вверх;
 * 			"bottom" - автопагинация вниз.
 *
 * Блок paginator используется совместно с блоком paste. При работе блока paginator определяется необходимость
 * показа объекта пагинации (объектом пагинациии может быть, например, ссылка "смотреть ещё...") и установку
 * события на объект пагинации. Два параметра channel1 и channel2 задают имена каналов, которые сообщают пагинатору,
 * что данные получены (html-код вставлен) и необходимо определить показ объекта пагинации. Два канала дают
 * возможность отслеживать вставку данных из разных блоков paste. Имена каналов должны совпадать с именами каналов
 * блока paste.
 * 
 * Параметр channel1 (первый именной канал) связывает канал блока paste и пагинатор, управляя процессом пагинации.
 * Это значит, что данные, отправляемые в связанный с пагинатором блок paste AJAX-кодом после их вставки проанализируются
 * кодом пагинатора и при необходимости будет показан объект пагинации (ссылка "смотреть ещё..."), если внутри вставленного
 * html-кода будет обнаружено скрытое поле с номером следующей запрашиваемой страницы.
 * 
 * Порядок работы channel1 следующий:
 * 
 * 1. AJAX-запрос отправляет через channel1 при помощи режима (mode) insert html-разметку в блок paste;
 * 2. Поле вставки html-разметки на странице пагинатор отправляет режим (mode) init в блок paste, которой скрывает или
 *    показывает элементы согласно установленному режиму.
 *
 * Если channel1 управляет непосредственно пагинацией, то channel2 используется при первичной вставки html-разметки.
 * То есть, channel2 вставляет html-разметку, после вставки которой пагинатор определяет возможность показа объекта
 * пагинацией. Сама же пагинация осуществляется через channel1.
 * 
 * Порядок работы channel2:
 *
 * 1. AJAX-код через именной канал channel2 передаёт команду на ожидание вставки html-кода. В этот момент пагинатор через
 *    channel1 передаёт передаёт команду на установку режима (mode) reset;
 * 2. AJAX-код получил данные от сервера и через именной канал channel2 передаёт команду вставки insert и сам html-код.
 *    После вставки html-кода пагинатор через channel1 передаёт команду на установку режима init.
 *
 * Пример установки пагинатора и 2х блоков paste:
 * 		"paste2":{ "channel":"addcomment" }, "paste3":{ "channel":"paginatorcomment", "init":{"other": true} },
 * 		"paginator":{ "channelnext":"nextlistphotos", "channel1":"paginatorcomment", "channel2":"addcomment" }
 *
 * Перечень элементов пагинатора:
 * 		paginator__object - объект на котором будет располагаться событие для просмотра следующей порции листинга;
 * 		paginator__page - объект со скрытым полем, содержащим значение page для пагинации.
 * 
 * Пример верстки элементов пагинатора:
 * 		<div class="paste__other paste__other_hide paginator__object block-center">смотреть ещё...</div>
 * 		<div class="paste__delete paste__delete_hide paste__delete paginator__page">
 * 			<input type="hidden" name="page" value="1">
 * 		</div>
 * 
 * Если включена автопагинация (autopaginator равен top или bottom), то объект пагинации необходимо все равно указывать,
 * только без надписи "смотреть ещё...":
 * 		<div class="paginator__object"></div>
 */
modules.define('paginator', ['i-bem-dom', 'events__channels', 'jquery'], function(provide, bemDom, channels, $) {

provide(bemDom.declBlock(this.name,
	{
		/**
		 * МЕТОДЫ ЭКЗЕМПЛЯРА.
		 */

		/**
		 * Задание параметров по умолчанию.
		 */
		_getDefaultParams: function() {

			return {

				channel1: null,
				channel2: null,
				channelnext: null,
				autopaginator: null,
			}
		},

		/**
		 * Триггеры до установки модификаторов.
		 */
		beforeSetMod: {},

		/**
		 * Триггеры после установки модификаторов.
		 */
		onSetMod: {

			'js': {

				// Конструктор экземпляра.
				'inited': function() {

					// Объекты для работы.
					this._object = this.findChildElem( 'object' );

					// События.
					// Устанавливаем событие на объект пагинации (это может быть, например, ссылка "смотреть ещё").
					if ( this._object && !this.params.autopaginator ) {
						
						this._domEvents( this._object ).on( 'click', function( event ) {

							event.stopPropagation();
							event.preventDefault();
							this._nextPaginator();
						});
					}

					// Если включена верхняя автопагинация.
					if ( this._object && this.params.autopaginator == 'top' ) {

						this._domEvents().on( 'scroll', { mythis:this }, function( event ) {
							
							if ( event.data.mythis.domElem.scrollTop() == 0 ) {

								// Скролл достиг верха.
								event.data.mythis._nextPaginator();
							}
						});
					}

					// Если включена нижняя автопагинация.
					if ( this._object && this.params.autopaginator == 'bottom' ) {

						this._domEvents().on( 'scroll', { mythis:this }, function( event ) {

						  let height_top = event.data.mythis.domElem.scrollTop();
						  let height_win = this.domElem.height();
						  if ( (height_win + height_top) >= this.domElem[0].scrollHeight ) {

							// Скролл достиг низа.
							event.data.mythis._nextPaginator();
						  }
						});
					}

					// Следующие события будут определять варианты показа привязанного блока к пагинатору (channel1) и не привязанного блока (channel2).
					// Вставка привязанным к пагинатору блоком "paste" html-кода.
					if ( this.params.channel1 ) {
						
						channels( this.params.channel1 ).on( 'insert', { mythis: this }, function( event ) {

							let page = event.data.mythis.findChildElem( 'page' );
							if ( page ) {

								channels( event.data.mythis.params.channel1 ).emit( 'init' );
							}
						});
					}

					// Непривязанный канал ожидает вставки данных.
					if ( this.params.channel2 ) {

						channels( this.params.channel2 ).on( 'wait', { mythis: this }, function( event ) {

							channels( event.data.mythis.params.channel1 ).emit( 'reset' );
						});
					}

					// Непривязанный канал вставил данные.
					if ( this.params.channel2 ) {

						channels( this.params.channel2 ).on( 'insert', { mythis: this }, function( event ) {

							let page = event.data.mythis.findChildElem( 'page' );
							if ( page ) {

								channels( event.data.mythis.params.channel1 ).emit( 'init' );
							}
						});
					}
				}
			}
		},

		/**
		 * Создаёт событие именного канала на получение следующей порции данных пагинации.
		 */
		_nextPaginator: function() {

			// Определяем значение скрытого поля "input", которое содержит значение "page".
			let page = this.findChildElem( 'page' );
			if ( page && this.params.channelnext ) {

				channels( this.params.channelnext ).emit( 'next', page.domElem.find( 'input[name="page"]' ).val() );
			}
		},
    },
	{
		/**
		 * СТАТИЧЕСКИЕ МЕТОДЫ.
		 */
	}

));

});

/**
 * БЛОК "textareasmiles".
 *
 * Основные настройки:
 * 	@param {string} channel
 *    Имя канала, по которому будет отправлена html-разметка новых сообщений.
 *  @param {number} k
 *    Коэффициент высоты текстового поля, когда оно находится в фокусе.
 *  @param {int} height_box_smiles
 *    Высота панели в "px" со смайлами.
 *  @param {string} openside bottom|top|auto
 *    В какую сторону раскрывать панель со смайликами.
 *
 * Блок предназначен отправки текстового сообщения со смайликами на сервер и для передачи текстового сообщения в блок "paste",
 * который вставит сообщение в нужное место страницы.
 *
 * Для вставки html-кода необходимо к блоку или элементу добавить класс (примиксовать класс) "textarea-smiles i-bem". Далее указать необходимые
 * параметры блока data-bem = '{ "textarea-smiles":{} }'.
 *
 * Для добавления на страницу "textarea-smiles" необходимо разместить следующую разметку (примерная разметка):
 *
 * <form class="textarea-smiles i-bem" method="get" action=":3000/mails.html" data-bem='{ "textarea-smiles":{"channel":"addcomment"} }'>
 * 		@@include( 'common/textarea-smiles/textarea-smiles.html' )
 * </form>
 */
modules.define('textareasmiles', ['i-bem-dom', 'events__channels', 'jquery'], function(provide, bemDom, channels, $) {

provide(bemDom.declBlock(this.name,
	{
		/**
		 * МЕТОДЫ ЭКЗЕМПЛЯРА.
		 */

		/**
		 * Задание параметров по умолчанию.
		 */
		_getDefaultParams: function() {

			return {

				channel: null,
				//url: null,
				k: 3.2,
				height_box_smiles: 50,
				openside: 'top',
			}
		},

		/**
		 * Триггеры до установки модификаторов.
		 */
		beforeSetMod: {},

		/**
		 * @type {boolean}
		 *    Указывает на отображение панели со смайликами: "false" - панель скрыта; "true" - панель показана.
		 */
		_flagsmile: false,

		/**
		 * @type {boolean}
		 *    Указывает на отображение текстового поля для ввода текста: "false" - показан плейсхолдер, а текстовое поле скрыто;
		 *    "true" - текстовое поле показано, а плейсхолдер скрыт.
		 */
		_flagtextarea: false,

		/**
		 * Триггеры после установки модификаторов.
		 */
		onSetMod: {

			'js': {

				// Конструктор экземпляра.
				'inited': function() {

					// Основные объекты.
					this._div_placeholder = this.findChildElem( 'placeholder' );
					this._div_textarea = this.findChildElem( 'textarea' );
					this._btn_smile = this.findChildElem( 'btn-smile' );
					this._box_smiles = this.findChildElem( 'box-smiles' );
					this._sub_text_smiles = this.findChildElem( 'sub-text-smiles' );

					// Запрещаем фокусироваться на блоке со смайликами.
					this._box_smiles.domElem.attr({

						unselectable: 'on',
						onselectstart: 'return false;',
						onmousedown: 'return false;',
					});

					// Создаём элементы смайликов и добавляем их в панель.
					let fragment = document.createDocumentFragment();
					let box_sm = this._box_smiles.domElem;
					for (let i = 1; i <= 207; i++) {
						
						let span = document.createElement( 'span' );
						span.classList.add( 'textareasmiles__emoji' );
						span.classList.add( 'textareasmiles__emoji_e' + i );
						fragment.appendChild( span );
					}
					box_sm[0].appendChild( fragment );
					this._span_emoji = this.findChildElems( 'emoji' );

					// События.
					// Щелчок по плейсхолдеру (имитация текстового поля).
					this._domEvents( this._div_placeholder ).on( 'click', function( event ) {
						
						this._showTextarea();
					});

					// Щелчок в любом месте экрана.
					this._domEvents( bemDom.win ).on( 'click', function( event ) {

						this._originalState();
					});

					// Щелчок в текстовом поле.
					this._domEvents( this._div_textarea ).on( 'click', function( event ) {

						this._flagtextarea = true;
					});

					// Щелчок по смайлику.
					this._box_smiles._domEvents( this._span_emoji ).on( 'click', function( event ) {

						this.domElem.find( 'div.textareasmiles' ).find( 'div:last[contenteditable="true"]' ).focus();
						// Вставляем смайлик.
						let sel, range;
						sel = window.getSelection();
						if ( sel.getRangeAt && sel.rangeCount ) {

							range = sel.getRangeAt(0);
							range.deleteContents();
							let el = document.createElement( "div" );
							el.innerHTML = ' <img class="textareasmiles__emoji ' + event.target.classList[1] + '" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAAtJREFUCNdjIBEAAAAwAAFletZ8AAAAAElFTkSuQmCC"> ';
							let frag = document.createDocumentFragment(), node, lastNode;
							while ( (node = el.firstChild) ) {

								lastNode = frag.appendChild(node);
							}
							range.insertNode(frag);
							if ( lastNode ) {

								range = range.cloneRange();
								range.setStartAfter( lastNode );
								range.collapse( true );
								sel.removeAllRanges();
								sel.addRange( range );
							}
						}
					});

					// Щелчок по кнопке открытия смайлов.
					this._domEvents( this._btn_smile ).on( 'click', function( event ) {

						this._flagtextarea = true;
						if ( this._flagsmile == true ) {

							// Панель со смайлами показана, необходимо её скрыть.
							this._box_smiles.setMod( 'hide' );
							this._flagsmile = false;
						}
						else {

							// Панель со смайлами скрыта, необходимо её показать.
							let len = this._div_textarea.domElem.text().length;
							if ( len == 0 ) {

								// В текстовом поле отсутствует текст.
								this._div_placeholder.setMod( 'hide' );
								this._showTextarea();
							}
							this._div_textarea.domElem.trigger( 'resize' );
							// Показываем панель со смайликами.
							this._showSmiles();
						}
					});

					// Щелчок в текстовом поле.
					this._domEvents( this._div_textarea ).on( 'input', function( event ) {

						let lentext = this._div_textarea.domElem.html().length;
						if ( lentext > 0 ) {

							if ( this._sub_text_smiles.hasMod( 'hide' ) ) this._sub_text_smiles.delMod( 'hide' );
						}
						else {

							this._sub_text_smiles.setMod( 'hide' );
						}
					});

					// Щелчок по кнопке "Отправить".
					this._domEvents( this._sub_text_smiles ).on( 'click', function( event ) {

						event.stopPropagation();
						event.preventDefault();
						let content = this._div_textarea.domElem.html();
						// Заменяем все изображения смайликов на шаблон, содержащий в себе класс "textarea-smiles__emoji_e" из тега изображения с его значением.
						// Например: <{e102}>.
						content = content.replace(/<img class="textareasmiles__emoji\s{1}textareasmiles__emoji_e/g, '<!--');
						content = content.replace(/"\ssrc="[^"]+"(\sstyle="[^"]+")*>/g, '-->');
						// Пустую строку не отправлять на сервер.
						if ( content.length == 0 ) {

							alert( 'Введите текст!' );

							return false;
						}
						// Делаем кнопку неактивной на время отправки AJAX-запроса
						this._sub_text_smiles.domElem.prop( 'disabled', true );
						this._div_textarea.domElem.prop( 'contenteditable', false );
						if ( this.params.channel ) {

							channels( this.params.channel ).emit( 'wait' );
						}
						// Отправляем текст в AJAX-запросе.
						this._emit( 'sendingmessage', content );
					});

					// AJAX-запрос успешно отправил комментарий пользователя на сервер.
					this._events().on( 'sendingmessagecomplete', { mythis: this }, function( event, html ) {

						// Разблокируем кнопку.
						event.data.mythis._sub_text_smiles.domElem.prop( 'disabled', false );
						event.data.mythis._div_textarea.domElem.prop( 'contenteditable', true );
						// Отправляем html-разметку новых сообщений в блок "paste" для вставки.
						// Заменяем шаблон на изображения смайликов.
						let new_html = html.replace( /<\!--/g, '<span class="textareasmiles__emoji textareasmiles__emoji_border_delete textareasmiles__emoji_e' );
						new_html = new_html.replace( /-->/g, '"></span>' );
						channels( event.data.mythis.params.channel ).emit( 'insert', new_html );
						// Очищаем текстовое поле.
						event.data.mythis._div_textarea.domElem.html('');
						// Возвращаем "textarea-smiles" в первоначальное состояние.
						event.data.mythis._originalState();
					});

					// Изменение размеров текстового поля.
					this._domEvents( this._div_textarea ).on( 'resize', function( event ) {

						// Устанавливаем ширину панели со смайлами такую же, как у текстового поля.
						let width_textarea = this._div_textarea.domElem.width();
						this._box_smiles.domElem.width( width_textarea + 2 );
						// Устанавливаем высоту панели со смайликами в зависимости от настроек.
						this._box_smiles.domElem.height( this.params.height_box_smiles );
					});
	        
				}
			}
		},

		/**
		 * Приводит поле для смайликов в первоначальное состояние.
		 */
		_originalState: function() {

			if ( this._flagtextarea === false ) {

				var len = this._div_textarea.domElem.text().length;
				if ( len == 0 ) {

					if ( this._div_textarea.hasMod( 'show' ) ) {

						this._div_textarea.delMod( 'show' );
					}
					this._div_textarea.setMod( 'hide' );
					if ( this._div_placeholder.hasMod( 'hide' ) ) {

						this._div_placeholder.delMod( 'hide' );
					}
					this._div_placeholder.setMod( 'show' );
				}
				this._box_smiles.setMod( 'hide' );
				this._flagsmile = false;
			}
			this._flagtextarea = false;
		},

		/**
		 * Показываем панель со смайлами внизу или вверху от текстового поля, в зависимости от настроек.
		 */
		_showSmiles: function() {

			if ( this.params.openside == 'bottom' || this.params.openside == 'top' ) {

				this._showSmilesBottomTop( this.params.openside );
			}
			if ( this.params.openside == 'auto' ) {

				// Определяем автоматически в какую сторону паказывать панель со смайлами.
				let H = document.documentElement.clientHeight;
				let h = this._div_textarea.domElem.height();
				let scroll = this._div_textarea.domElem.offset().top;
				let offset = scroll + (h / 2);
				if ( (H / 2) > offset ) {

					this._showSmilesBottomTop( 'bottom' );
				}
				if ( (H / 2) < offset ) {
	
					this._showSmilesBottomTop( 'top' );
				}
				if ( (H / 2) == offset ) {

					this._showSmilesBottomTop( 'bottom' );
				}
			}
		},

		/**
		 * Добавляет стили к панели со смайликами, открывая панель вверх или вниз.
		 *
		 * @param {string} side
		 * 		Устанавливает, в какую сторону открывать панель со смайликами (bottom|top).
		 */
		_showSmilesBottomTop: function( side ) {

			let height_textarea = this._div_textarea.domElem.innerHeight();
			if ( side == 'bottom' ) {

				this._box_smiles.domElem.css( 'top', height_textarea + 'px' );
			}
			if ( side == 'top' ) {

				let h = this._box_smiles.domElem.innerHeight();
				this._box_smiles.domElem.css( 'top', '-' + h + 'px' );
			}
			if ( this._box_smiles.hasMod( 'hide' ) ) {

				this._box_smiles.delMod( 'hide' );
			}
			this._box_smiles.setMod( 'show' );
			this._flagsmile = true;
		},

		/**
		 * Показывает текстовое поле для ввода текста.
		 */
		_showTextarea: function() {

			this._flagtextarea = true;
			// Определяем высоту элемента плейсхолдера.
			let height_placeholder = this._div_placeholder.domElem.height();
			// Скрываем плейсхолдер и показываем текстовое поле с установкой фокуса.
			if ( this._div_placeholder.hasMod( 'show' ) ) {

				this._div_placeholder.delMod( 'show' );
			}
			this._div_placeholder.setMod( 'hide' );
			if ( this._div_textarea.hasMod( 'hide' ) ) {

				this._div_textarea.delMod( 'hide' );
			}
			this._div_textarea.setMod( 'show' );
			this._div_textarea.domElem.height( height_placeholder * this.params.k );
			this._div_textarea.domElem.focus();
		},
	},
	{
		/**
		 * СТАТИЧЕСКИЕ МЕТОДЫ.
		 */
	}

));

});

/**
 * БЛОК "paste-1".
 */
modules.define( 'paste-1', ['i-bem-dom', 'events__channels', 'jquery'], function( provide, bemDom, channels, $ ) {

provide( bemDom.declBlock( this.name,
	{
		/**
		 * МЕТОДЫ ЭКЗЕМПЛЯРА.
		 */

		/**
		 * Задание параметров по умолчанию.
		 */
		_getDefaultParams: function() {

			return {

				name : null,// Уникальное имя блока.
				type_insert : 'simple',// Тип вставки: "simple", "paginator".
				mode_sending_request_ajax : 'wait',// Режим для отправки ajax-запроса.
				mode_getting_response_ajax : 'insert',// Режим для вставки полученных данных от ajax-запроса.
				url : null,
				display_modes : {// Режимы отображения внутреннего содержимого (элементов) блока paste-1.

					init : {

						trubber: false,
						other: true,
						replace: false,
					},
					wait : {

						trubber: true,
						other: false,
						replace: false,
					},
					insert : {

						trubber: false,
						other: false,
						replace: true,
					},
					reset : {

						trubber: false,
						other: false,
						replace: false,
					},
					twoup : {
						
						trubber: true,
						other: true,
						replace: false,
					},
					twodown : {
						
						trubber: false,
						other: true,
						replace: true,
					},
					twocenter : {
						
						trubber: true,
						other: false,
						replace: true,
					},
					all : {
						
						trubber: true,
						other: true,
						replace: true,
					},
				},
				ajax_type : "GET",
				ajax_dataType : "html",
			}
		},

		/**
		 * Будет содержать массив объектов элементов блока.
		 */
		_elem_div: [],
		
		/**
		 * Имя переменной скрытого поля. При указание параметра "name" присваивает его значение.
		 */
		_page: "page",

	    /**
	     * Триггеры до установки модификаторов.
	     */
	    beforeSetMod: {},

		/**
		 * Триггеры после установки модификаторов.
		 */
		onSetMod: {

			'js': {

				// Конструктор экземпляра.
				'inited': function(modName, modVal, prevModVal) {

					// Основные объекты.
					this._mainObject();

					// Если к блоку применён модификатор "_event_load".
					if ( this.hasMod( 'event', 'load' ) && this.params.type_insert == 'simple' ) {

						let mythis = this;
						this.domElem.ready( function ( event ) {
							
							mythis._ajax( event );
						});
					}

					// Установка событий на существующие объекты.
					let events = [ 'click', 'change' ];
					for ( let i = 0; i <= events.length; i++ ) {

						for ( let k = 0; k <= this._elem_div.length; k++ ) {

							// Проверка на установку модификаторов событий:
							// "paste-1__trubber_event_click", "paste-1__trubber_event_change" и т.д.
							if ( k < 3 && this._elem_div[k] && this._elem_div[k].hasMod( 'event', events[i] ) ) {
								
								this._event( this._elem_div[k], events[i] );
							}

							// Проверка на использование в блоке элементов событий: "paste-1__click", "paste-1__change".
							if ( k > 2 && this._elem_div[k] ) {
								
								this._event( this._elem_div[k], events[i] );
							}
						}
					}
					
					// Если установлен режим пагинации.
					if ( this.params.type_insert == 'paginator' ) {
						
						// Если задан параметр "name":
						if ( this.params.name ) {
							
							this._page = this.params.name;
						}

						// Необходимо проверить, есть ли внутри элемента "paste-1__replace" скрытое поле.
						if ( this._elem_div__replace.domElem.find('input[name="' + this._page + '"]').length ) {
							
							this._elem_div__other.delMod( 'hide' );
						}
					}

					// Если задано имя блока, создаём именной канал для запуска событий.
					if ( this.params.name ) {

						channels( this.params.name ).on('click change', { mythis : this }, function( event ) {

							event.data.mythis._ajax( event );
						});
					}
				}
			}
		},

		/**
		 * Основные объекты.
		 */
		_mainObject: function() {
			
			// Основные элементы.
			this._elem_div__trubber = this._elem_div[0] = this.findChildElem( 'trubber' );
			this._elem_div__other   = this._elem_div[1] = this.findChildElem( 'other' );
			this._elem_div__replace = this._elem_div[2] = this.findChildElem( 'replace' );

			// Элементы событий.
			this._elem_div__click   = this._elem_div[3] = this.findChildElem( 'click' );
			this._elem_div__change  = this._elem_div[4] = this.findChildElem( 'change' );
		},
		
		/**
		 * Установка события на указанный элемент.
		 */
		_event: function( obj, event_ ) {
			
			this._domEvents( obj ).on( event_, function( event ) {
								
				this._ajax( event );
			});
		},

		/**
		 * AJAX-запрос.
		 *
		 * @param {object} event
		 * 		Объект, на котором произошло событие.
		 */
		_ajax: function( event ) {
			
			// Для режима пагинации необходимо определить адрес AJAX-запроса.
			if ( this.params.type_insert == 'paginator' && this._elem_div__replace ) {
				
				this.params.url = this._elem_div__replace.domElem.find('input[name="' + this._page + '"]').val();
			}

			let mythis = this;
			if ( this.params.url ) {
				
				let _url = new URL( window.location.href );
				let _newUrl = new URL( this.params.url, _url );

				$.ajax({

					type: mythis.params.ajax_type,
					cache: false,
					url: _newUrl,
					dataType: mythis.params.ajax_dataType,
				    processData: false,
				    contentType: false,
					beforeSend: function( xhr ) {

						// Устанавливаем соответствующий режим отображения элементов "trubber", "other", "replace".
						let mode = mythis.params.mode_sending_request_ajax;
						mythis._setupElem( mode );
					},
					success: function( html, textStatus, request ) {

						mythis._insert( html );
						mythis._mainObject();
						
						// Для режима пагинации необходимо проверить наличие скрытого поля в элементе "paste-1__replace".
						if ( mythis.params.type_insert == 'paginator' ) {
							
							if ( mythis._elem_div__replace && mythis._elem_div__replace.domElem.find('input[name="page"]').length ) {
								
								// Показываем элемент пагинации (элемент "paste-1__other").
								mythis._setupElem( 'init' );
							}
							else {
								
								mythis._setupElem( 'reset' );
								
								// Удаляем элемент пагинации и труббер.
								bemDom.destruct( mythis._elem_div__other.domElem );
								bemDom.destruct( mythis._elem_div__trubber.domElem );
							}
						}
						else {
							
							// Устанавливаем соответствующий режим отображения элементов "trubber", "other", "replace".
							let mode = mythis.params.mode_getting_response_ajax;
							mythis._setupElem( mode );
						}
						
						// Если задано имя блока, сообщаем по именому каналу, что вставка данных прошла успешна.
						if ( mythis.params.name ) {

							channels( mythis.params.name ).emit( 'success' );
						}
						
					},
					error: function( html ) {

						alert( 'На сервере произошла ошибка! Приносим свои извинения...' );
					},
				});
			}
		},

		/**
		 * Устанавливает режимы отображения элементов "trubber", "other", "delete".
		 *
		 * @param {mode} mode init|wait|insert|reset
		 *    Режимы отображения элементов "trubber", "other", "delete" согласно заданным параметрам.
		 */
		_setupElem: function( mode ) {

			let mythis = this;
			let object_param = null;
			// Выбираем режим.
			switch( mode ) {

				case 'init':
					object_param = mythis.params.display_modes.init;
					break;
				case 'wait':
					object_param = mythis.params.display_modes.wait;
					break;
				case 'insert':
					object_param = mythis.params.display_modes.insert;
					break;
				case 'reset':
					object_param = mythis.params.display_modes.reset;
					break;
				case 'twoup':
					object_param = mythis.params.display_modes.twoup;
					break;
				case 'twodown':
					object_param = mythis.params.display_modes.twodown;
					break;
				case 'twocenter':
					object_param = mythis.params.display_modes.twocenter;
					break;
				case 'all':
					object_param = mythis.params.display_modes.all;
					break;
			}

			if ( mythis._elem_div__trubber ) {

				if ( object_param.trubber ) {
					
					mythis._elem_div__trubber.delMod( 'hide' );
				}
				else {
					
					mythis._elem_div__trubber.setMod( 'hide' );
				}
			}

			if ( mythis._elem_div__other ) {

				if ( object_param.other ) {

					mythis._elem_div__other.delMod( 'hide' );
				}
				else {

					mythis._elem_div__other.setMod( 'hide' );
				}
			}

			if ( mythis._elem_div__replace ) {

				if ( object_param.replace ) {
					
					mythis._elem_div__replace.delMod( 'hide' );
				}
				else {
					
					mythis._elem_div__replace.setMod( 'hide' );
				}
			}
		},
		
		/**
		 * Вставка html-разметки с заменой элемента(-ов) "paste__delete" внутри блока.
		 *
		 * @param {string} html
		 *    Строка, содержащая html разметку.
		 */
		_insert: function( html ) {
			
			this._elem_div__replace = this.findChildElems( 'replace' );
			if ( this._elem_div__replace.size() > 0 ) {

				let i = 1;
				this._elem_div__replace.forEach( function( object ) {
					
					if ( i == 1) {

						// Первый элемент "replace" подменяем на html-разметку, пришедшую от AJAX-запроса.
						bemDom.replace( object.domElem, html );
						i++;
					}
					else {
						
						// Последующие элементы "replace" просто удаляем.
						bemDom.destruct( object.domElem );
					}
				});
			}
		},
	},
	{
		/**
		 * Cтатические методы.
		 */
	}
));

});

/**
 * БЛОК "ext-paste".
 */
modules.define( 'ext-paste', ['i-bem-dom', 'events__channels', 'jquery'], function( provide, bemDom, channels, $ ) {

provide( bemDom.declBlock( this.name,
	{
		/**
		 * МЕТОДЫ ЭКЗЕМПЛЯРА.
		 */

		/**
		 * Задание параметров по умолчанию.
		 */
		_getDefaultParams: function() {
			
			return {
				
				name : null,// Имя блока, именной канал которого получит соответствующее событие.
			}
		},

		/**
	     * Триггеры до установки модификаторов.
	     */
	    beforeSetMod: {},

		/**
		 * Триггеры после установки модификаторов.
		 */
		onSetMod: {

			'js': {

				// Конструктор экземпляра.
				'inited': function() {
					
					// Проверяем модификаторы блока и вешаем соответствующие события.
					// click
					if ( this.hasMod( 'event', 'click' ) ) {
						
						this._domEvents().on( 'click', { mythis : this }, function(event) {

							channels( event.data.mythis.params.name ).emit( 'click' );
						});
					}
					
					// change
					if ( this.hasMod( 'event', 'change' ) ) {
						
						this._domEvents().on( 'change', { mythis : this }, function(event) {
							
							channels( event.data.mythis.name ).emit( 'change' );
						});
					}
				}
			}
		},
	},
	{
		/**
		 * Cтатические методы.
		 */
	}
));

});
		




