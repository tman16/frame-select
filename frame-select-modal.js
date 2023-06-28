      var frame_extra = [
    {
      id: 'MATTBLACKALPHA',
      color: '#000000',
      size: '10px',
      description: `A bespoke gallery-grade frame with a premium anodized matt black finish. Handmade in UK with premium materials.`
    },
    {
      id: 'MATTSILVERALPHA',
      color: '#e3e3e3',
      size: '10px',
      description: `A bespoke gallery-grade frame with a premium anodized matt silver finish. Handmade in UK with premium materials.`
    }
  ];
    function generateCache() {
      let framing_cache = {};
      framing_cache.frame_combinations = frame_options;
      framing_cache.frame_options = frame_options.reduce((accumulator, current) => {
        if(current.option1 && JSON.stringify(accumulator).indexOf(current["name"].split(' -')[0]) < 0) {
          accumulator.push({id: current.id, price: current.price, name: current["name"], frame_name: current["name"].split(' -')[0], value: current["sku"].split('-')[0], options: current.options, image: current.featured_image ? current.featured_image["src"] : null});
        } else if (current.option1 && JSON.stringify(accumulator).indexOf(current["name"].split(' -')[0]) > -1 && current.price < accumulator.price) {
          accumulator = accumulator.filter(x=>x.name !== current.name);
          accumulator.push({id: current.id, price: current.price, name: current["name"], frame_name: current["name"].split(' -')[0], value: current["sku"].split('-')[0], options: current.options, image: current.featured_image ? current.featured_image["src"] : null});
        }
        return accumulator;
      },[]);
      framing_cache.size_options = frame_options.reduce((accumulator, current) => {
        if(current.option1 && !accumulator.includes(current["option1"])) {
          accumulator.push(current["option1"])
        }
        return accumulator;
      },[]);
      framing_cache.glazing_options = frame_options.reduce((accumulator, current) => {
        if(current.option2 && !accumulator.includes(current["option2"])) {
          accumulator.push(current["option2"])
        }
        return accumulator;
      },[]);
      framing_cache.mount_options = frame_options.reduce((accumulator, current) => {
        if(current.option3 && !accumulator.includes(current["option3"])) {
          accumulator.push(current["option3"])
        }
        return accumulator;
      },[]);

      framing_cache.options_price = function() {
        let options_prices = [];
        if (framing_cache.glazing_options.length > 0) {
          framing_cache.frame_options.forEach(fo=>{
            framing_cache.size_options.forEach(so=>{
              let test_lowest = framing_cache.frame_combinations.filter(x=>x.option1 === so && x.name.indexOf(fo.frame_name) > -1).reduce(function(prev, curr) {return curr.price < prev.price ? curr : prev;})
              options_prices.push({type: 'glazing', frame: fo.frame_name, size: so, price: test_lowest.price});
            });
          });
        };
        if (framing_cache.mount_options.length > 0) {
          framing_cache.frame_options.forEach(fo=>{
            framing_cache.size_options.forEach(so=>{
              framing_cache.glazing_options.forEach(go=>{
                let test_lowest = framing_cache.frame_combinations.filter(x=>x.option1 === so && x.option2 === go && x.name.indexOf(fo.frame_name) > -1).reduce(function(prev, curr) {return curr.price < prev.price ? curr : prev;})
                options_prices.push({type: 'mount', frame: fo.frame_name, size: so, glazing: go, price: test_lowest.price});
              })
            });
          });
        };
        return options_prices;
        //let lowest_matching_glazing_price = framing_cache.frame_combinations.reduce(function(prev, curr) {return curr.price < prev.price && curr.option1 === framing_cache.current_selection.frame_product.options[0] && curr.name.indexOf(framing_cache.current_selection.frame_product.frame_name) > -1 ? curr : prev;});
        
      }();
      console.log('framing_cache.options_price',framing_cache.options_price)
      
      framing_cache.current_selection = { main_product: { id: first_variant_id, name: product_title, price: first_variant_price }, frame_product: {} };
      framing_cache.artwork_sizes = function () {
        let artwork_options = []
        let raw_variants = product_variants;
        raw_variants.forEach(rv=>{
          artwork_options.push({id: rv.id, size: rv.option1})
        })
        return artwork_options
      }()
      framing_cache.preview_image = first_variant_metafield_preview_image;

      framing_cache.steps = function() {
        let step_complete_icon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g><path fill-rule="evenodd" clip-rule="evenodd" d="M9.70711 14.2929L19 5L20.4142 6.41421L9.70711 17.1213L4 11.4142L5.41421 10L9.70711 14.2929Z" fill="#fff"></path></g></svg>`;
        let steps_arr = [];
        if (framing_cache.size_options.length > 0) {
          framing_cache.selectors = [{id: 'selector_frame', selector: document.createElement('select')}];
          steps_arr.push({name: 'Choose Frame',icon_initial: '1', icon_complete: step_complete_icon});
        };
        if (framing_cache.glazing_options.length > 0) {
          framing_cache.current_selection.glazing_product = {};
          steps_arr.push({name: 'Choose Glazing',icon_initial: steps_arr.length+1, icon_complete: step_complete_icon});
        }
        return steps_arr;
      }();
      return framing_cache;
    };
      
    function startAddFrame() {
      //Construct object
      let framing_cache = generateCache();
      console.log('framing_cache',framing_cache);
      if (framing_cache.size_options.length === 0) {console.log('Must have a product with option1 as size'); return;};
      
      var background_container = document.createElement('div');
      background_container.style.cssText = `position: fixed; z-index: 999999; top: 0; left: 0; width: 100%; height: 100%;`;

      var container = document.createElement('div');
      container.style.cssText = `position: absolute; display: block; top: 50%; left: 50%; transform: translate(-50%,-50%); max-width: 1000px; width: 100%; height: 100%; background-color: #FFFFFF; padding: 20px; overflow-y: scroll;`;
      background_container.appendChild(container);

      var container_close = document.createElement('div');
      container_close.style.cssText = `display: flex; padding: 10px; justify-content: end; align-items: center; cursor: pointer;`;
      container.appendChild(container_close);

      var close_text = document.createElement('h2');
      close_text.style.cssText = `font-size: 14px; text-transform: uppercase; margin-right: 5px;`;
      close_text.innerHTML = 'Close';
      container_close.appendChild(close_text);

      var close_icon = document.createElement('div');
      close_icon.style.cssText = `display: flex; justify-content: center; align-items: center; width: 24px; height: 24px; background-color: #000000; border-radius: 50%; padding: 7px;`;
      close_icon.innerHTML = `<svg width="16" height="16" viewBox="5 5 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><g><path fill-rule="evenodd" clip-rule="evenodd" d="M13.4142 12L19.7782 18.364L18.364 19.7782L12 13.4142L5.63604 19.7782L4.22183 18.364L10.5858 12L4.22183 5.63604L5.63604 4.22183L12 10.5858L18.364 4.22183L19.7782 5.63604L13.4142 12Z" fill="#ffffff"></path></g></svg>`;
      container_close.appendChild(close_icon);
      container_close.addEventListener('click',()=>{
        background_container.remove();
      });
      container_close.addEventListener('mouseover',()=>{
        close_text.style.color = 'rgb(252, 105, 59)';
        close_text.style.textDecoration = 'underline 3px';
      });
      container_close.addEventListener('mouseleave',()=>{
        close_text.style.color = '#000000';
        close_text.style.textDecoration = '';
      });

      //MAIN CONTAINER
      var framing_container = document.createElement('div');
      framing_container.setAttribute('class','framing_container');
      framing_container.style.cssText = `display: flex;`;
      container.appendChild(framing_container);

      //FRAMING CONTAINER
      var framing_options_cont = document.createElement('div');
      framing_options_cont.style.cssText = `width: 100%; padding: 20px;`;
      framing_container.appendChild(framing_options_cont);

      var framing_steps_container = document.createElement('div');
      framing_options_cont.appendChild(framing_steps_container);
      framing_steps_container.style.cssText = `display: flex; position: relative; justify-content: space-evenly; margin-bottom: 13px;`;

      let live_content_container = document.createElement('div');
      framing_options_cont.appendChild(live_content_container);
      
      let overview_table = document.createElement('div');
      overview_table.style.cssText = `margin-top: 13px;`;
      framing_options_cont.appendChild(overview_table);

      //PREVIEW CONTAINER
      var preview_cont = document.createElement('div');
      preview_cont.setAttribute('class','preview_container');
      preview_cont.style.cssText = `width: 100%; padding: 0px 40px 0px 40px;`;
      framing_container.appendChild(preview_cont);

      var preview_canvas_cont = document.createElement('div');
      preview_canvas_cont.style.cssText = `box-shadow: 3px 3px 8px #0000003b;`;
      preview_cont.appendChild(preview_canvas_cont);
      
      var preview_canvas = document.createElement('canvas');
      preview_canvas.width = 100;
      preview_canvas.height = 100;
      preview_canvas.style.cssText = `width: 100%;`;
      preview_canvas_cont.appendChild(preview_canvas);

      //CSS STYLES
      let popup_styles = document.createElement('style');
      popup_styles.innerHTML = `
        @media only screen and (max-width: 600px) {
          .framing_container {
            flex-direction: column-reverse;
          }
        }
      `;
      background_container.appendChild(popup_styles);
      
      //Add main container
      document.documentElement.appendChild(background_container);
      
      //Add preview image
      if (framing_cache.preview_image) {
        if (framing_cache.preview_image.aspect_ratio) {
          const ctx = preview_canvas.getContext("2d");
          const image = new Image();
          image.crossOrigin = "anonymous";
          image.onload = () => {
            preview_canvas.width = image.naturalWidth;
            preview_canvas.height = image.naturalHeight;
            ctx.drawImage(image, 0, 0);
            ctx.drawImage(image, 0, 0, image.width, image.height);
          };
          image.src = framing_cache.preview_image.src;
        }
      }

      //Init
      updateSteps(framing_steps_container,'frame');
      updateOverview(overview_table,framing_cache.current_selection.frame_product,function(){glazingStep(live_content_container)},'Next');
      framingStep(live_content_container);

      //Functions
      function framingStep(parent_el) {
        parent_el.innerHTML = '';
        var frame_selector = document.createElement('div');
        frame_selector.style.cssText = `display: flex; width: 100%; overflow-x: scroll;`;
        parent_el.appendChild(frame_selector);

        if (framing_cache.current_selection.frame_product && framing_cache.current_selection.frame_product.id) {
          var frame_info_label = document.createElement('div');
          frame_info_label.setAttribute('class','h2');
          frame_info_label.style.cssText = `font-size: 18;`;
          frame_info_label.innerHTML = framing_cache.current_selection.frame_product.frame_name;
          parent_el.appendChild(frame_info_label);

          var frame_info_description = document.createElement('div');
          frame_info_description.setAttribute('class','text-body');
          frame_info_description.style.cssText = `font-size: 1.2rem;`;
          frame_info_description.innerHTML = frame_extra.find(x=>x.id===framing_cache.current_selection.frame_product.extra_value).description;
          parent_el.appendChild(frame_info_description);
        }

        var sizes_container_outer,sizes_container;
        if (framing_cache.size_options.length > 1) {
          sizes_container_outer = document.createElement('div');
          sizes_container_outer.setAttribute('class','select');
          
          sizes_container = document.createElement('select');
          sizes_container.setAttribute('class','select select__select');
          sizes_container.style.cssText = `width: 100%;`;//padding: 10px; text-align: center; margin-top: 13px;
          sizes_container.addEventListener('change',() => {
            framing_cache.current_selection.main_product.id = framing_cache.artwork_sizes.find(x=>x.size===sizes_container.value).id;
            framing_cache.current_selection.frame_product.options[0] = sizes_container.value;
            let new_frame_product = framing_cache.frame_combinations.find(x=>x.option1===sizes_container.value && x.options.every(elem => framing_cache.current_selection.frame_product.options.includes(elem)))
            framing_cache.current_selection.frame_product.id = new_frame_product.id;
            framing_cache.current_selection.frame_product.name = new_frame_product.name;
            framing_cache.current_selection.frame_product.price = new_frame_product.price;
            updateOverview(overview_table,framing_cache.current_selection.frame_product,function() {glazingStep(live_content_container)},'Next')
          });
          sizes_container_outer.appendChild(sizes_container);

          var select_icon = document.createElement('div');
          select_icon.innerHTML = `<svg aria-hidden="true" focusable="false" class="icon icon-caret" viewBox="0 0 10 6"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.354.646a.5.5 0 00-.708 0L5 4.293 1.354.646a.5.5 0 00-.708.708l4 4a.5.5 0 00.708 0l4-4a.5.5 0 000-.708z" fill="currentColor"></path></svg>`;
          sizes_container_outer.appendChild(select_icon);
        }
        
        framing_cache.frame_options.forEach(fo=>{
          let frame_option_container = document.createElement('div');
          frame_option_container.style.cssText = `display: flex; flex-direction: column; max-width: 120px; padding: 10px; border: 2px solid #cccccc; margin-right: 6px; cursor: pointer;`;
          if (framing_cache.current_selection.frame_product && framing_cache.current_selection.frame_product.id && fo.frame_name === framing_cache.current_selection.frame_product.frame_name) {
            frame_option_container.style.border = 'solid 2px rgb(252, 105, 59)';
            let avaliable_sizes = framing_cache.frame_combinations.filter(x=>x.name.split(' -')[0]===framing_cache.current_selection.frame_product.frame_name).reduce((accumulator, current) => {if(!accumulator.includes(current["option1"])) {accumulator.push(current["option1"])}return accumulator;},[]);
            if (avaliable_sizes.length > 1) {
              avaliable_sizes.forEach(as=>{
                var size_option = document.createElement('option');
                if (framing_cache.current_selection.frame_product.options[0] === as) {
                  size_option.setAttribute('selected',true);
                };
                size_option.innerHTML = as;
                size_option.value = as;
                sizes_container.appendChild(size_option);
              });
              let sizes_label = document.createElement('div');
              sizes_label.setAttribute('class','h2');
              sizes_label.style.cssText = 'margin-top: 13px; font-size: 18px';
              sizes_label.innerHTML = 'Sizes'
              parent_el.appendChild(sizes_label)
              
              parent_el.appendChild(sizes_container_outer);
            }
          }
          frame_option_container.addEventListener('click', () => {
            frame_option_container.style.opacity = '1';
            preview_canvas_cont.style.border = `solid ${frame_extra.find(x=>x.id===fo.value).size} ${frame_extra.find(x=>x.id===fo.value).color}`;
            if (framing_cache.current_selection.frame_product && framing_cache.current_selection.frame_product.id) {
              framing_cache.current_selection.frame_product = function() {
                console.log('target fo', fo);
                let new_frame_selection = framing_cache.frame_combinations.find(x=>x.name.indexOf(fo.frame_name) > -1 && x.option1===framing_cache.current_selection.frame_product.options[0] && (framing_cache.current_selection.frame_product.options.length > 1 ? (x.option2 === framing_cache.current_selection.frame_product.options[1] ? true : false) : true) && (framing_cache.current_selection.frame_product.options.length > 2 ? (x.option3 === framing_cache.current_selection.frame_product.options[2] ? true : false) : true));
                console.log('final_obj',{id: new_frame_selection.id, name: new_frame_selection.name, frame_name: new_frame_selection.name.split(' -')[0], options: new_frame_selection.options, image: new_frame_selection.featured_image ? new_frame_selection.featured_image["src"] : null, price: new_frame_selection.price, extra_value: new_frame_selection.sku.split('-')[0]})
                return {id: new_frame_selection.id, name: new_frame_selection.name, frame_name: new_frame_selection.name.split(' -')[0], options: new_frame_selection.options, image: new_frame_selection.featured_image ? new_frame_selection.featured_image["src"] : null, price: new_frame_selection.price, extra_value: new_frame_selection.sku.split('-')[0]};
              }();
            } else {
              framing_cache.current_selection.frame_product = {id: fo.id, name: fo.name, frame_name: fo.frame_name, options: fo.options, image: fo.image, price: fo.price, extra_value: fo.value};
            };
            framingStep(live_content_container);
            updateOverview(overview_table,framing_cache.current_selection.frame_product,function() {glazingStep(live_content_container)},'Next')
            updateSteps(framing_steps_container,'frame');
            console.log(fo.image,fo.name,fo.value);
          });
          frame_option_container.addEventListener('mouseover', () => {
            frame_option_container.style.opacity = '0.7';
          });
          frame_option_container.addEventListener('mouseleave', () => {
            frame_option_container.style.opacity = '1';
          });
          frame_selector.appendChild(frame_option_container);

          let frame_option_image_container = document.createElement('div');
          frame_option_container.appendChild(frame_option_image_container);
        
          let frame_option_image = document.createElement('img');
          frame_option_image.style.cssText = `width: 100%;`;
          frame_option_image.src = fo.image;
          frame_option_image_container.appendChild(frame_option_image);

          let frame_option_text = document.createElement('h3');
          frame_option_text.innerHTML = fo.frame_name.replace(' Frame','');
          frame_option_text.style.cssText = `text-align: center; text-transform: uppercase;`;
          frame_option_image_container.appendChild(frame_option_text);
        });

        updateSteps(framing_steps_container,'frame');

        return frame_selector;
      }

      function glazingStep(parent_el) {
        parent_el.innerHTML = '';
        updateOverview(overview_table,framing_cache.current_selection.glazing_product,function() {addToCart(framing_cache)},'Add to cart');

        var glazing_selector = document.createElement('div');
        glazing_selector.style.cssText = `display: flex; width: 100%; overflow-x: scroll; justify-content: space-evenly`;
        parent_el.appendChild(glazing_selector);
        
        framing_cache.glazing_options.forEach(fo=>{
          var glazing_option = document.createElement('input');
          glazing_option.setAttribute('class','h2 button');
          glazing_option.style.cssText = `margin: 0 15px; border 2px #000000; border-radius: 7px; text-align: center;`;
          glazing_option.value = fo;
          glazing_option.innerHTML = fo;
          if (framing_cache.current_selection.frame_product && framing_cache.current_selection.frame_product.id && framing_cache.current_selection.glazing_product && framing_cache.current_selection.glazing_product.name) {
            if (framing_cache.current_selection.frame_product.options[1] === fo) {
              glazing_option.style.backgroundColor = 'rgb(252, 105, 59)';
            }
          }
          glazing_option.addEventListener('click', ()=>{
            glazing_option.style.opacity = '1';
            framing_cache.current_selection.frame_product.options[1] = glazing_option.value;
            //Get new matching frame details
            let new_frame_product = framing_cache.frame_combinations.find(x=>x.option1===framing_cache.current_selection.frame_product.options[0]&&x.option2===glazing_option.value && x.options.every(elem => framing_cache.current_selection.frame_product.options.includes(elem)) && x.name.indexOf(framing_cache.current_selection.frame_product.frame_name) > -1)
            console.log('new_frame_product',new_frame_product)
            //Get lowest matching frame to calculate value
            let lowest_matching_glazing_price = framing_cache.frame_combinations.reduce(function(prev, curr) {return curr.price < prev.price && curr.option1 === framing_cache.current_selection.frame_product.options[0] && curr.name.indexOf(framing_cache.current_selection.frame_product.frame_name) > -1 ? curr : prev;});
            framing_cache.current_selection.frame_product.id = new_frame_product.id;
            framing_cache.current_selection.frame_product.name = new_frame_product.name;
            framing_cache.current_selection.frame_product.price = new_frame_product.price;
            framing_cache.current_selection.frame_product.options[1] = glazing_option.value;
            framing_cache.current_selection.glazing_product.name = glazing_option.value;
            framing_cache.current_selection.glazing_product.price = function(){
              console.log('framing_cache.options_price.find(x=>x.size === framing_cache.current_selection.frame_product.options[0] && x.frame === framing_cache.current_selection.frame_product.frame_name && x.type === glazing)',framing_cache.options_price.find(x=>x.size === framing_cache.current_selection.frame_product.options[0] && x.frame === framing_cache.current_selection.frame_product.frame_name && x.type === 'glazing'))
              if (framing_cache.options_price.find(x=>x.size === framing_cache.current_selection.frame_product.options[0] && x.frame === framing_cache.current_selection.frame_product.frame_name && x.type === 'glazing')) {
                return new_frame_product.price - framing_cache.options_price.find(x=>x.size === framing_cache.current_selection.frame_product.options[0] && x.frame === framing_cache.current_selection.frame_product.frame_name && x.type === 'glazing').price;
              } else {
                return new_frame_product.price - lowest_matching_glazing_price.price;
              };
            }();
            glazingStep(live_content_container);
            updateOverview(overview_table,framing_cache.current_selection.glazing_product,function() {background_container.remove();addToCart(framing_cache)},'Add to cart');
            updateSteps(framing_steps_container,'glazing');
          })
          glazing_selector.appendChild(glazing_option);
        });

        updateSteps(framing_steps_container,'glazing');

        return glazing_selector;
      }

      function updateOverview(parent_el,current_step_obj,next_step_function,next_button_text) {
        parent_el.innerHTML = '';

        let overview_artwork_row = document.createElement('div');
        overview_artwork_row.style.cssText = `display: flex; justify-content: space-between;`;
        parent_el.appendChild(overview_artwork_row);

        let overview_artwork_title = document.createElement('div');
        overview_artwork_title.style.cssText = `font-size: 18px;`;
        overview_artwork_title.setAttribute('class','h2');
        overview_artwork_title.innerHTML = 'Artwork'
        overview_artwork_row.appendChild(overview_artwork_title);

        let overview_artwork_name = document.createElement('div');
        overview_artwork_name.style.cssText = `font-size: 14px;`;
        overview_artwork_name.setAttribute('class','h2');
        overview_artwork_name.innerHTML = framing_cache.current_selection.main_product.name;
        overview_artwork_row.appendChild(overview_artwork_name);

        let overview_artwork_price = document.createElement('div');
        overview_artwork_price.style.cssText = `font-size: 18px;`;
        overview_artwork_price.setAttribute('class','h2');
        overview_artwork_price.innerHTML = curr_symbol + framing_cache.current_selection.main_product.price/100;
        overview_artwork_row.appendChild(overview_artwork_price);

        if (framing_cache.current_selection.frame_product && framing_cache.current_selection.frame_product.id) {
        let overview_frame_row = document.createElement('div');
        overview_frame_row.style.cssText = `display: flex; justify-content: space-between;`;
        overview_table.appendChild(overview_frame_row);
        
        let overview_frame_title = document.createElement('div');
        overview_frame_title.style.cssText = `font-size: 18px;`;
        overview_frame_title.setAttribute('class','h2');
        overview_frame_title.innerHTML = 'Frame'
        overview_frame_row.appendChild(overview_frame_title);

        let overview_frame_name = document.createElement('div');
        overview_frame_name.style.cssText = `font-size: 14px;`;
        overview_frame_name.setAttribute('class','h2');
        overview_frame_name.innerHTML = framing_cache.current_selection.frame_product.frame_name;
        overview_frame_row.appendChild(overview_frame_name);

        let overview_frame_price = document.createElement('div');
        overview_frame_price.style.cssText = `font-size: 18px;`;
        overview_frame_price.setAttribute('class','h2');
        overview_frame_price.innerHTML = function() {
          if (framing_cache.current_selection.glazing_product && framing_cache.current_selection.glazing_product.name) {
            return curr_symbol + (framing_cache.current_selection.frame_product.price-framing_cache.current_selection.glazing_product.price)/100
          } else {
            return curr_symbol + framing_cache.current_selection.frame_product.price/100;
          }
        }();
        overview_frame_row.appendChild(overview_frame_price);
        }

        if (framing_cache.current_selection.glazing_product && framing_cache.current_selection.glazing_product.name) {
        let overview_glazing_row = document.createElement('div');
        overview_glazing_row.style.cssText = `display: flex; justify-content: space-between;`;
        overview_table.appendChild(overview_glazing_row);
        
        let overview_glazing_title = document.createElement('div');
        overview_glazing_title.style.cssText = `font-size: 18px;`;
        overview_glazing_title.setAttribute('class','h2');
        overview_glazing_title.innerHTML = 'Glazing'
        overview_glazing_row.appendChild(overview_glazing_title);

        let overview_glazing_name = document.createElement('div');
        overview_glazing_name.style.cssText = `font-size: 14px;`;
        overview_glazing_name.setAttribute('class','h2');
        overview_glazing_name.innerHTML = framing_cache.current_selection.frame_product.options[1];
        overview_glazing_row.appendChild(overview_glazing_name);

        let overview_glazing_price = document.createElement('div');
        overview_glazing_price.style.cssText = `font-size: 18px;`;
        overview_glazing_price.setAttribute('class','h2');
        overview_glazing_price.innerHTML = framing_cache.current_selection.glazing_product.price === 0 ? 'FREE' : curr_symbol + (framing_cache.current_selection.glazing_product.price/100);
        overview_glazing_row.appendChild(overview_glazing_price);
        }

        let overview_total_row = document.createElement('div');
        overview_total_row.style.cssText = `display: flex; justify-content: space-between; border-top: solid 2px #000000;`;
        overview_table.appendChild(overview_total_row);

        let overview_total_title = document.createElement('div');
        overview_total_title.style.cssText = `font-size: 18px;`;
        overview_total_title.setAttribute('class','h2');
        overview_total_title.innerHTML = 'Total'
        overview_total_row.appendChild(overview_total_title);

        let overview_total_price = document.createElement('div');
        overview_total_price.setAttribute('class','h2');
        overview_total_price.style.cssText = `font-size: 18px;`;
        overview_total_price.innerHTML = function() {
          console.log('framing_cache2',framing_cache)
          if (framing_cache.current_selection.mount_product && framing_cache.current_selection.mount_product.id && framing_cache.current_selection.glazing_product && framing_cache.current_selection.glazing_product.id && framing_cache.current_selection.frame_product && framing_cache.current_selection.frame_product.id) {
            return curr_symbol + (framing_cache.current_selection.main_product.price + framing_cache.current_selection.mount_product.price + framing_cache.current_selection.glazing_product.price + framing_cache.current_selection.frame_product.price)/100;
          } else if (framing_cache.current_selection.glazing_product && framing_cache.current_selection.glazing_product.id && framing_cache.current_selection.frame_product && framing_cache.current_selection.frame_product.id) {
            return curr_symbol + (framing_cache.current_selection.main_product.price + framing_cache.current_selection.glazing_product.price + framing_cache.current_selection.frame_product.price)/100;
          } else if (framing_cache.current_selection.frame_product && framing_cache.current_selection.frame_product.id) {
            return curr_symbol + (framing_cache.current_selection.main_product.price + framing_cache.current_selection.frame_product.price)/100;
          } else {
            return curr_symbol + (framing_cache.current_selection.main_product.price)/100
          }
        }();
        overview_total_row.appendChild(overview_total_price);

        let progress_button = document.createElement('div');
        progress_button.setAttribute('class','h2');
        progress_button.style.cssText = `border: none; padding: 13px; text-align: center; text-transform: uppercase; width: 100%; margin-top: 13px; background-color: #fc693b; color: #ffffff; font-size: 18px; cursor: pointer;`;
        if (current_step_obj.id || current_step_obj.name ? false : true) {
          progress_button.style.backgroundColor = '#e3e3e3';
        }
        progress_button.innerHTML = next_button_text ? next_button_text : 'Next';
        if (current_step_obj.id || current_step_obj.name) {
          progress_button.addEventListener('click',next_step_function);
          progress_button.addEventListener('mouseover', () => {
            //progress_button.style.opacity = '0.7';
            progress_button.style.textDecoration = 'underline 3px';
          });
          progress_button.addEventListener('mouseleave', () => {
            //progress_button.style.opacity = '1';
            progress_button.style.textDecoration = '';
          });
        }
        parent_el.appendChild(progress_button);
      }

      function updateSteps(parent_el,current_type) {
        parent_el.innerHTML = '';
        framing_cache.steps.forEach(fcs=>{
          let step_container = document.createElement('div');
          step_container.style.cssText = `display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer;`;
          /*step_container.addEventListener('mouseover', () => {
            step_container.style.opacity = '0.7';
          });
          step_container.addEventListener('mouseleave', () => {
            step_container.style.opacity = '1';
          });*/
          parent_el.appendChild(step_container);

          let step_chip = document.createElement('div');
          step_chip.setAttribute('class','h2');
          step_chip.style.cssText = `display: flex; font-size: 18px; justify-content: center; align-items: center; border: solid 4px #cccccc; background-color: #ffffff; color: #cccccc; border-radius: 50%; width: 34px; height: 34px;`;
          console.log('framingcache3',framing_cache.current_selection.frame_product.id)
          if (fcs.name === 'Choose Frame' && framing_cache.current_selection.frame_product.id) {
            step_chip.style.backgroundColor = '#000000';
            step_chip.style.color = '#000000';
            if (current_type === 'frame') {
              step_chip.style.backgroundColor = 'rgb(252, 105, 59)';
              step_chip.style.borderColor = 'rgb(252, 105, 59)';
            }
            step_chip.innerHTML = fcs.icon_complete;
          } else if (fcs.name === 'Choose Glazing' && framing_cache.current_selection.glazing_product.name) {
            step_chip.style.backgroundColor = '#000000';
            step_chip.style.color = '#000000';
            if (current_type === 'glazing') {
              step_chip.style.backgroundColor = 'rgb(252, 105, 59)';
              step_chip.style.borderColor = 'rgb(252, 105, 59)';
            }
            step_chip.innerHTML = fcs.icon_complete;
          } else {
            step_chip.innerHTML = fcs.icon_initial;
            if (fcs.name === 'Choose Frame' && current_type === 'frame') {
              step_chip.style.borderColor = 'rgb(252, 105, 59)';
            } else if (fcs.name === 'Choose Glazing' && current_type === 'glazing') {
              step_chip.style.borderColor = 'rgb(252, 105, 59)';
            }
          }
          step_container.appendChild(step_chip);

          let step_text = document.createElement('div');
          step_text.setAttribute('class','h2');
          step_text.style.cssText = `font-size: 14px; text-transform: uppercase;`;
          step_text.innerHTML = fcs.name;
          step_container.appendChild(step_text);

          if (fcs.name === 'Choose Frame') {
            step_container.addEventListener('click',()=>{
              step_container.style.opacity = '1';
              framingStep(live_content_container);
              updateOverview(overview_table,framing_cache.current_selection.frame_product,function() {glazingStep(live_content_container)},'Next')
            });
          } else if (fcs.name === 'Choose Glazing') {
            step_container.addEventListener('click',()=>{
              if (!framing_cache.current_selection.frame_product.id) return;
              step_container.style.opacity = '1';
              glazingStep(live_content_container);
              updateOverview(overview_table,framing_cache.current_selection.glazing_product,function() {addToCart(framing_cache)},'Add to cart')
            });
          }
        });
        
        let progress_bar = document.createElement('div');
        console.log('parent_el.offsetWidth',(parent_el.offsetWidth))
        console.log('test length %',(34/parent_el.offsetWidth))
        progress_bar.style.cssText = `position: absolute; z-index: -2; top: 16px; left: ${(100/framing_cache.steps.length)}%; transform: translate(-50%,-50%); width: ${100-((100/framing_cache.steps.length)+((32/parent_el.offsetWidth)*100))}%; height: 4px; background-color: #cccccc;`;
        progress_bar.innerHTML = ' ';
        parent_el.appendChild(progress_bar)

        let progress_bar_overlay = document.createElement('div');
        progress_bar_overlay.style.cssText = `position: absolute; z-index: -1; top: 16px; left: ${(100/framing_cache.steps.length)}%; transform: translate(-50%,-50%); width: 0%; height: 4px; background-color: #000000;`;
        if (current_type === 'glazing') progress_bar_overlay.style.width = (100/framing_cache.steps.length-((32/parent_el.offsetWidth)*100))+'%';
        if (current_type === 'mount') progress_bar_overlay.style.width = (100/framing_cache.steps.length-((32/parent_el.offsetWidth)*100))+'%';
        progress_bar_overlay.innerHTML = ' ';
        parent_el.appendChild(progress_bar_overlay)
      }

    };

    async function addToCart(obj) {
      let add_spinner = addSpinner();
      console.log('Add to cart clicked')
      try {
      let items = [];
      if (obj.current_selection.main_product && obj.current_selection.main_product.id) items.push(obj.current_selection.main_product.id);
      if (obj.current_selection.frame_product && obj.current_selection.frame_product.id) items.push(obj.current_selection.frame_product.id);
      let items_added = [];
      let failed_item;
      for (let item of items) {
        let fetch_cart = await fetch(window.Shopify.routes.root + 'cart/add.js',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({'items': [{'id': item,'quantity': 1}]})
          }
        );
        if (fetch_cart.ok) {
          console.log('OK')
          let res_cart = await fetch_cart.json();
          items_added.push(res_cart)
        } else {
          failed_item = true;
          console.log('NOT OK');
          let res_cart = await fetch_cart.json();
          console.log('failed json',res_cart)
          if (res_cart.status === 422) {
            alert(res_cart.description);
          }
        }
      }
        if (failed_item) {
        if (items_added.length > 0) {
          for (let item of items_added) {
            item = item.items[0];
            try {
              let fetch_delete_cart = await fetch(window.Shopify.routes.root + 'cart/change.js',{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({'id': item.key,'quantity': 0})
                }
              );
                if (fetch_delete_cart.ok) {
                  let res_delete_cart = await fetch_delete_cart.json();
                  console.log('deleted product')
                }
              } catch (err) {
                console.log('error',err)
              }
            }
          }
        } else {
          if (items_added.length > 0) addedToCartPopup(items_added);
        }
        add_spinner.remove();
      } catch (err) {
        console.log(err);
        add_spinner.remove();
      }
    }

    function addSpinner() {
      var background_container = document.createElement('div');
      background_container.style.cssText = `position: fixed; z-index: 999999; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6);`;
      document.documentElement.appendChild(background_container);
      
      var container = document.createElement('div');
      container.style.cssText = `position: absolute; display: block; top: 50%; left: 50%; transform: translate(-50%,-50%);`;
      container.innerHTML = `<i class="fa-solid fa-spinner fa-spin fa-2xl" style="color: #ffffff;"></i>`;
      background_container.appendChild(container);

      return background_container;
    }

    async function addedToCartPopup(items) {
      console.log('items',items)
        var background_container = document.createElement('div');
      background_container.style.cssText = `position: fixed; z-index: 999999; top: 0; left: 0; display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6);`;
      document.documentElement.appendChild(background_container);
      
      var container = document.createElement('div');
      container.style.cssText = `max-width: 700px; width: 100%; margin: 20px; background-color: #ffffff; overflow-y: scroll;`;
      background_container.appendChild(container);

      var title_bar_container = document.createElement('div');
      title_bar_container.style.cssText = `display: flex; padding: 20px; background-color: #f3f3f3`;
      container.appendChild(title_bar_container);

      var title_bar_text = document.createElement('div');
      title_bar_text.setAttribute('class','h2');
      //title_bar_container.style.cssText = ``;
      title_bar_text.innerHTML = `Your artwork has been added to cart`;
      title_bar_container.appendChild(title_bar_text);

      var title_bar_close = document.createElement('div');
      title_bar_close.setAttribute('class','h2');
      //title_bar_close.style.cssText = `background-color: #f3f3f3`;
      title_bar_close.innerHTML = `Close`;
      title_bar_close.addEventListener('click',()=>background_container.remove());
      title_bar_container.appendChild(title_bar_close);

      var main_content_container = document.createElement('div');
      main_content_container.style.cssText = `padding: 20px;`;
      container.appendChild(main_content_container);
      
      items.forEach(item =>{
        item = item.items[0];
        console.log('item',item)
        var item_row = document.createElement('div');
        item_row.style.cssText = `display: flex; justify-content: space-between; align-items: center;`;
        main_content_container.appendChild(item_row);

        var item_image_container = document.createElement('div');
        item_image_container.style.cssText = `display: flex;`;
        item_row.appendChild(item_image_container);

        var item_image = document.createElement('img');
        item_image.src = item.image;
        item_image.style.cssText = `width: 100%; max-width: 150px;`;
        item_image_container.appendChild(item_image);

        var item_text = document.createElement('div');
        item_text.setAttribute('class','h2');
        //item_row.style.cssText = ``;
        item_text.innerHTML = item.product_title
        item_row.appendChild(item_text);

        var item_price = document.createElement('div');
        item_price.setAttribute('class','h2');
        //item_row.style.cssText = ``;
        item_price.innerHTML = item.price;
        item_row.appendChild(item_price);
      })
      
    }
