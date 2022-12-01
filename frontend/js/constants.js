const showObject = { "name" : "",
                    "languages" : [],
                    "scene-order": [],
                    "scenes" : {}                 
}

const stepObject = {        
                        "background-color" : "", 
                        "image" : [],
                        "video" : [],
                        "stream" : [],
                        "text" : [],
                        "avatar" : "", 
                        "console" : ""
                    };

const sceneObject = {
                        "name" : "",
                        "step-order" : [],
                        "steps" : {}
                    };

const global = {"top" : "",
                "left" : "", 
                "z-index" : ""
                };

const editor_media_div_css = {
                        "top": "",
                        "left": "",
                        "z-index": 1,
                        "width": "100%",
                        "height": "100%",
                    };

const editor_image_css = {
                            "object-fit" : "",
                            "background-color" : "",
                            "background-image" : "",
                            "transform" : ""
                        };
                        
const imageObject = {   "width" : "",
                        "height" : "",
                        "object-fit" : "",
                        "background-color" : "",
                        "background-image" : "",
                        "transform" : "",
                        "src" : ""
                    };



const videoObject = {   "width" : "",
                        "height" : "",
                        "object-fit" : "",
                        "background-image" : "",
                        "transform" : "",
                        "loop" : false,
                        "muted" : false,
                        "src" : ""
                    };

const streamObject = {  "width" : "",
                        "height" : "",
                        "object-fit" : "",
                        "background-image" : "",
                        "transform" : "",
                        "deviceId" : ""
                    };

const textObject = {    "background-color" : "",
                        "color" : "",
                        "font-family" : "", 
                        "font-size" : "", 
                        "font-weight" : "", 
                        "font-style" : "", 
                        "text-decoration" : "", 
                        "border" : "", 
                        "transform" : ""
                    };

const avatarObject = {  "width" : "", 
                        "height" : "", 
                        "background-color" : "", 
                        "background-image" : ""
                    };

const consoleObject = {"width" : "", 
                        "height" : ""
                    };

const languages = {
                    'sq' : 'Albanian',
                    'ar' : 'Arabic',
                    'hy' : 'Armenian',
                    'be' : 'Belarusian',
                    'bs' : 'Bosnian',
                    'bg' : 'Bulgarian',
                    'zh' : 'Chinese',
                    'hr' : 'Croatian',
                    'cs' : 'Czech',
                    'da' : 'Danish',
                    'nl' : 'Dutch, Flemish',
                    'en' : 'English',
                    'eo' : 'Esperanto',
                    'et' : 'Estonian',
                    'fi' : 'Finnish',
                    'fr' : 'French',
                    'gd' : 'Gaelic, Scottish Gaelic',
                    'de' : 'German',
                    'el' : 'Greek (Modern)',
                    'ht' : 'Haitian, Haitian Creole',
                    'he' : 'Hebrew',
                    'hu' : 'Hungarian',
                    'is' : 'Icelandic',
                    'ga' : 'Irish',
                    'it' : 'Italian',
                    'ja' : 'Japanese',
                    'ko' : 'Korean',
                    'lv' : 'Latvian',
                    'lt' : 'Lithuanian',
                    'mk' : 'Macedonian',
                    'no' : 'Norwegian',
                    'pl' : 'Polish',
                    'pt' : 'Portuguese',
                    'ru' : 'Russian',
                    'sr' : 'Serbian',
                    'sk' : 'Slovak',
                    'sl' : 'Slovenian',
                    'es' : 'Spanish, Castilian',
                    'sv' : 'Swedish',
                    'tr' : 'Turkish',
                    'uk' : 'Ukrainian',
                    'vi' : 'Vietnamese',
                    'cy' : 'Welsh',
                };
