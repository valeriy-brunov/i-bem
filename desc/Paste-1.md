# Paste-1

Блок "Paste-1" (далее paste) предназначен для вставки html-верстки внутрь себя, полученной от AJAX-запроса.

Стандартная верстка блока paste будет выглядеть так:

```html
<div class="paste-1...i-bem" data-bem='{"paste-1":{} }'>
	<div class="paste-1__trubber paste-1__trubber_hide">...</div>
	<div class="paste-1__other">...</div>
	<div class="paste-1__replace paste-1__replace_hide">...</div>
</div>
```
Обычно блок paste примиксовывают к другому блоку, чтобы выполнять вспомогательные функции по обработке AJAX-запросов.

В блоке paste каждый элемент предназначен для выполнения определённых функций:

```
__trubber - труббер или анимация, которую пользователь будет наблюдать во время ожидания AJAX-запроса;
__replace - элемент замены, именно данный элемент будет заменён содержимым AJAX-запросом;
__other   - может располагаться любое содержимое в зависимости от задумки.
```

## Основные параметры.

```
@param {string} name
			Имя блока. Должно быть уникальным на странице. Указывают для запуска
			события из внешнего блока, например, блока ext-paste или сообщает через
			именной канал с именем name (событие "success"), что AJAX данные упешно вставлены.
			Указывать не обязательно.
@param {string} type_insert
			Тип вставки: "simple", "paginator".
@param {string} mode_sending_request_ajax
			Режим отображения при отправки AJAX-запроса.
@param {string} mode_getting_response_ajax
			Режим отображения после вставки данных AJAX-запросом.
@param {string} url
			Адрес AJAX-запроса.
@param {string} display_modes
			Режимы отображения.
```

## Элементы событий.

Элементы событий позволяют устанавливать и привязывать события к блоку paste. При возникновении привязанных событий блок paste запускает AJAX-запрос.

К элементам предусмотрены специальные модификаторы:

```
_hide         - скрывает содержимое;
_event_click  - устанавливает событие click;
_event_change - устанавливает событие change.
```

Также есть специализированные элементы событий:

```
__click  - элемент события click;
__change - элемент события change.
```

К блоку paste можно применить модификатор события "_event_load", который привязывает событие загрузки блока на страницу.

## Тип вставки.

### Простой "type_insert" : "simple".

После возникновения события вставляет html-вёрстку, присланную AJAX-запросом. Для данного типа вставки в параметрах блока обязательно необходимо указывать адрес AJAX-запроса.
Данный тип вставки выбран по умолчанию. Например:

```html
<div class="paste-1...i-bem" data-bem='{"paste-1":{"url":"ddddd/fffff"} }'>...</div>
```

### С пагинацией "type_insert" : "paginator".

Определяет необходимость показа объекта пагинации и осуществляет пагинацию. Для осуществления пагинации необходимо сделать следующее:

1. В контроллёре:

	```php
	public function index()
	{
		$this->loadComponent( 'Paginator' );
		    
		$query = ...;
		 
		$this->paginate = ['limit' => 10];
		$f = $this->paginate( $query )->toList();
		    
		$this->set('f', $f);

		// Меняем вид, если параметр "page" больше 1.
		if ($this->request->getQuery('page') > 1) {
				
			$this->render('replace');
		}
	}
	```

2. Настроить вид "index.php":

	```php
	<div class="paste-1 ... i-bem" data-bem='{ "paste-1":{"type_insert":"paginator"} }'>

		<?php
			// Здесь вставить листинг.
		?>

		<?php echo // Блок пагинации без внешней оболочки.
			$this->element('blocks/views/paste/paginator', ['n' => 1, 'paste' => 'top']);
		?>

	</div>
	```

3. В виде "replace.php".

	```php
	<?php
		$this->Paginator->setTemplates([
			'nextActive' => '<input type="hidden" name="page" value="{{url}}">',
			'nextDisabled' => '',
		]);
	?>

	<?php
		// Здесь вставить листинг.
	?>

	<?php if( $this->Paginator->next() ): ?>
	<div class="paste-1__replace paste-1__replace_hide">
		<?php echo $this->Paginator->next(); ?>
	</div>
	<?php endif; ?>
	```

### Множественная пагинация на странице.

Для множественной пагинации необходимо создать контроллёр с двумя видами: первоначальной загрузки
страницы и обрабатывающий AJAX-запрос. Пример такого пагинатора был приведён выше.
Добавим в вышеприведённый пример ещё один листинг с пагинацией. Для этого создадим ячейку
(cell) также с двумя видами: первоначальной загрузки страницы и AJAX-запроса.

1. Контроллёр ячейки.

	```php
		/**
		 * Default display method.
		 * 
		 * @param {string} $url
		 * 		Адрес AJAX-запроса.
		 * @return void
		 */
		public function display( $url = null )
		{

			$this->loadModel('Comments');
			
			$paginator = new Paginator();
			$results = $paginator->paginate(
		        $this->Comments,
		        $this->request->getQueryParams(),
		        [
					'limit' => 3,
		        ]
		    );
		    
		    $paging = $paginator->getPagingParams() + (array)$this->request->getAttribute('paging');
		    $this->request = $this->request->withAttribute('paging', $paging);
		    
		    $this->set('com', $results);
		    if ( $url ) {
				
				$this->set('url', $url);
			}
		}
	```

2. Вид ячейки "display.php" для первоначальной загрузки страницы.

	```php
		<div class="paste-1 i-bem" data-bem='{ "paste-1":{"type_insert":"paginator","name":"valera3"} }'>
	
			<?php
				// Здесь вставить листинг.
			?>
			
			<?php echo $this->element('blocks/views/paste/paginator', ['n' => 1, 'paste' => 'top', 'url' => ($url ?? null)]); ?>
			
		</div>
	```

3. Вид ячейки "replace.php" для AJAX-запроса.

	```php
		<?php
			$this->Paginator->setTemplates([
				'nextActive' => '<input type="hidden" name="page" value="{{url}}">',
				'nextDisabled' => '',
			]);
		?>

		<?php
			// Здесь вставить листинг.
		?>

		<?php if( $this->Paginator->next() ): ?>
		<div class="paste-1__replace paste-1__replace_hide">
			<?php echo $this->Paginator->next(); ?>
		</div>
		<?php endif; ?>
	```

4. Теперь в вид основного контроллёра "index.php" необходимо добавить ячейку, чтобы она могла отобразиться при
первоначальной загрузке страницы. Обратите внимание, что ячейки необходимо передать
дополнительный параметр url - адрес AJAX-запроса.

	```php
	<div class="paste-1 ... i-bem" data-bem='{ "paste-1":{"type_insert":"paginator"} }'>

		<?php
			// Здесь вставить листинг.
		?>

		<?php echo // Блок пагинации без внешней оболочки.
			$this->element('blocks/views/paste/paginator', ['n' => 1, 'paste' => 'top']);
		?>

		<?php
			// Добавить:
			// Ячейка Test с новым адресом AJAX-запроса.
			echo $this->cell('Test', ['url' => '/testblock/ajax2']);
		?>

	</div>
	```

5. В сам основной контроллёр необходимо добавить действие "ajax2".

	```php
	public function index()
	{
		$this->loadComponent( 'Paginator' );
		    
		$query = ...;
		 
		$this->paginate = ['limit' => 10];
		$f = $this->paginate( $query )->toList();
		    
		$this->set('f', $f);

		// Меняем вид, если параметр "page" больше 1.
		if ($this->request->getQuery('page') > 1) {
				
			$this->render('replace');
		}
	}

	/**
	 * Добавить новое действие.
	 */
	public function ajax2()
    {
    }
	```

6. К действию "ajax2" создать вид "ajax2.php"  со следующим содержимым.

	```php
	<?=$this->cell('Test')->render('replace')?>
	```













