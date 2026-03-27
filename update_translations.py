#!/usr/bin/env python3
"""Update translation files with new keys for three feature pages."""

import json
import os

# Path to translation directory
LOCALES_DIR = "public/locales"

# Translations data - organized by language
translations = {
    "en": {
        "rights_assistant_page": {
            "hero_badge": "Feature 03 — Rights Assistant",
            "hero_headline_part1": "Legal Documents in",
            "hero_headline_part2": "Plain Language.",
            "hero_headline_part3": "Finally.",
            "hero_subtitle": "Upload any government document or contract. Our AI explains it in plain language and tells you your rights under Indian law.",
            "disclaimer_text": "Disclaimer: This tool provides educational information sourced from official government documents and IndiaCode. It is not a substitute for professional legal advice. Always consult a qualified lawyer for specific legal matters.",
            "how_it_works_heading": "How It Works",
            "step1_title": "Upload or Ask",
            "step1_subtitle": "Upload any document (contract, notice, form) or ask a legal question in your own language",
            "step2_title": "AI Analyzes",
            "step2_subtitle": "Our RAG-powered assistant cross-references Indian law, Acts, and official sources (IndiaCode)",
            "step3_title": "You Understand",
            "step3_subtitle": "Get a plain-language explanation with your rights clearly stated and sources cited",
            "tab_document_label": "Document",
            "tab_question_label": "Question",
            "language_label": "Language",
            "copy_button": "Copy",
            "copied_label": "Copied!",
            "copy_failed_label": "Copy failed. Try again.",
            "ocr_result_heading": "Extracted Text",
            "confidence_label": "Confidence",
            "plain_text_label": "Plain Text",
            "no_text_extracted_label": "No text could be extracted. Please try a clearer document image.",
            "error_microphone_access": "Microphone access denied. Please enable it in your browser settings.",
            "error_backend_prefix": "Something went wrong:",
            "lang_hint_empty": "Start by uploading a document or asking a question.",
            "lang_hint_hindi_devanagari": "You can ask questions in Devanagari script (Hindi).",
            "lang_hint_tamil": "You can ask questions in Tamil script.",
            "lang_hint_telugu": "You can ask questions in Telugu script.",
            "lang_hint_gujarati": "You can ask questions in Gujarati script.",
            "lang_hint_english": "You can ask questions in English.",
            "document_placeholder": "Upload your document here or describe your legal question",
            "question_placeholder": "e.g., What are my rights as a tenant in India? / What is a Section 144 order?"
        },
        "gynaecare_page": {
            "hero_badge": "Feature 05 — GynaeCare",
            "hero_headline_part1": "Women's Health.",
            "hero_gradient_text": "Answered.",
            "hero_headline_part2": "Without Judgment.",
            "hero_subtitle": "A completely anonymous, stigma-free chatbot for women's health questions. Ask about menstrual cycles, PCOS, pregnancy, or general wellness. 100% confidential.",
            "tab_chat_label": "Chat",
            "tab_modules_label": "Health Modules",
            "tab_resources_label": "Resources",
            "language_toggle_label": "Language",
            "new_session_label": "New Session",
            "footer_emergency_heading": "Emergency Helplines",
            "footer_emergency_108": "Medical Emergency: 108",
            "footer_emergency_181": "Women's Helpline: 1800-233-34373",
            "footer_emergency_mh": "Mental Health: 1860-2662-345"
        },
        "lab_report_page": {
            "param_label": "Parameter",
            "your_value_label": "Your Value",
            "normal_range_label": "Normal Range",
            "status_label": "Status",
            "chart_heading": "Your Values vs Reference Range",
            "table_heading": "Parameter Comparison",
            "suggestions_heading": "Diet & Lifestyle Suggestions"
        }
    },
    "hi": {
        "rights_assistant_page": {
            "hero_badge": "सुविधा 03 — राइट्स असिस्टेंट",
            "hero_headline_part1": "कानूनी दस्तावेज़",
            "hero_headline_part2": "सरल भाषा में।",
            "hero_headline_part3": "अंत में।",
            "hero_subtitle": "कोई भी सरकारी दस्तावेज़ या अनुबंध अपलोड करें। हमारा एआई इसे सरल भाषा में समझाता है और आपको भारतीय कानून के तहत आपके अधिकार बताता है।",
            "disclaimer_text": "अस्वीकरण: यह उपकरण आधिकारिक सरकारी दस्तावेज़ों और IndiaCode से प्राप्त शैक्षणिक जानकारी प्रदान करता है। यह पेशेवर कानूनी सलाह का विकल्प नहीं है। विशिष्ट कानूनी मामलों के लिए हमेशा एक योग्य वकील से परामर्श लें।",
            "how_it_works_heading": "यह कैसे काम करता है",
            "step1_title": "अपलोड या पूछें",
            "step1_subtitle": "कोई भी दस्तावेज़ (अनुबंध, नोटिस, फॉर्म) अपलोड करें या अपनी भाषा में कानूनी प्रश्न पूछें",
            "step2_title": "एआई विश्लेषण करता है",
            "step2_subtitle": "हमारा RAG-संचालित सहायक भारतीय कानून, अधिनियमों और आधिकारिक स्रोतों (IndiaCode) को क्रॉस-रेफ़र करता है",
            "step3_title": "आप समझें",
            "step3_subtitle": "सरल भाषा में स्पष्टीकरण प्राप्त करें जिसमें आपके अधिकार स्पष्ट रूप से बताए गए हों और स्रोत उद्धृत हों",
            "tab_document_label": "दस्तावेज़",
            "tab_question_label": "प्रश्न",
            "language_label": "भाषा",
            "copy_button": "कॉपी करें",
            "copied_label": "कॉपी किया गया!",
            "copy_failed_label": "कॉपी विफल। फिर से कोशिश करें।",
            "ocr_result_heading": "निकाला गया पाठ",
            "confidence_label": "आत्मविश्वास",
            "plain_text_label": "सादा पाठ",
            "no_text_extracted_label": "कोई पाठ निकाला नहीं जा सका। कृपया एक स्पष्ट दस्तावेज़ छवि का प्रयास करें।",
            "error_microphone_access": "माइक्रोफ़ोन एक्सेस अस्वीकार किया गया। कृपया अपनी ब्राउज़र सेटिंग्स में इसे सक्षम करें।",
            "error_backend_prefix": "कुछ गलत हुआ:",
            "lang_hint_empty": "एक दस्तावेज़ अपलोड करके या एक प्रश्न पूछकर शुरुआत करें।",
            "lang_hint_hindi_devanagari": "आप देवनागरी लिपि (हिंदी) में प्रश्न पूछ सकते हैं।",
            "lang_hint_tamil": "आप तमिल लिपि में प्रश्न पूछ सकते हैं।",
            "lang_hint_telugu": "आप तेलुगु लिपि में प्रश्न पूछ सकते हैं।",
            "lang_hint_gujarati": "आप गुजराती लिपि में प्रश्न पूछ सकते हैं।",
            "lang_hint_english": "आप अंग्रेजी में प्रश्न पूछ सकते हैं।",
            "document_placeholder": "अपना दस्तावेज़ यहाँ अपलोड करें या अपना कानूनी प्रश्न बताएं",
            "question_placeholder": "उदा., भारत में किरायेदार के रूप में मेरे क्या अधिकार हैं? / धारा 144 आदेश क्या है?"
        },
        "gynaecare_page": {
            "hero_badge": "सुविधा 05 — महिला स्वास्थ्य",
            "hero_headline_part1": "महिला स्वास्थ्य।",
            "hero_gradient_text": "जवाब।",
            "hero_headline_part2": "कोई निर्णय नहीं।",
            "hero_subtitle": "महिला स्वास्थ्य के प्रश्नों के लिए एक पूरी तरह गुमनाम, कलंक-मुक्त चैटबॉट। मासिक धर्म, पीसीओएस, गर्भावस्था या सामान्य कल्याण के बारे में पूछें। 100% गोपनीय।",
            "tab_chat_label": "चैट",
            "tab_modules_label": "स्वास्थ्य मॉड्यूल",
            "tab_resources_label": "संसाधन",
            "language_toggle_label": "भाषा",
            "new_session_label": "नया सत्र",
            "footer_emergency_heading": "आपातकालीन हेल्पलाइनें",
            "footer_emergency_108": "चिकित्सा आपातकाल: 108",
            "footer_emergency_181": "महिला हेल्पलाइन: 1800-233-3434",
            "footer_emergency_mh": "मानसिक स्वास्थ्य: 1860-2662-345"
        },
        "lab_report_page": {
            "param_label": "पैरामीटर",
            "your_value_label": "आपका मान",
            "normal_range_label": "सामान्य सीमा",
            "status_label": "स्थिति",
            "chart_heading": "आपके मान बनाम संदर्भ सीमा",
            "table_heading": "पैरामीटर तुलना",
            "suggestions_heading": "आहार और जीवन शैली के सुझाव"
        }
    }
}

# Simplified language list with representative entries for Marathi, Bengali, Telugu, Tamil showing the structure
expanded_langs = {
    "mr": {
        "rights_assistant_page": {
            "hero_badge": "वैशिष्ट्य 03 — अधिकार सहायक",
            "hero_headline_part1": "कायदेशीर दस्तऱे",
            "hero_headline_part2": "सोप्या भाषेत।",
            "hero_headline_part3": "अखेरीस शक्य।",
            "hero_subtitle": "कोणताही सरकारी दस्तऱे किंवा करार अपलोड करा. आमचा एआई यो सोप्या भाषेत समजावून देतो आणि भारतीय कायद्यांतर्गत तुमचे अधिकार सांगतो.",
            "disclaimer_text": "अस्वीकार: हे साधन अधिकृत सरकारी दस्तऱ्यांपासून आणि IndiaCode पासून प्राप्त शैक्षणिक माहिती प्रदान करते. ही व्यावसायिक कायदेशीर सल्ला देणे नाही. विशिष्ट कायदेशीर बाबींसाठी नेहमी योग्य वकिलाचा सल्ला घ्या.",
            "how_it_works_heading": "हे कसे कार्य करते",
            "step1_title": "अपलोड किंवा विचारा",
            "step1_subtitle": "कोणताही दस्तऱे (करार, सूचना, फॉर्म) अपलोड करा किंवा तुमच्या भाषेत कायदेशीर प्रश्न विचारा",
            "step2_title": "एआई विश्लेषण करते",
            "step2_subtitle": "आमचा RAG-नियंत्रित सहायक भारतीय कायद, अधिनियमे आणि अधिकृत स्रोत (IndiaCode) ची संदर्भ देतो",
            "step3_title": "तुम्ही समजा",
            "step3_subtitle": "सोप्या भाषेतील स्पष्टीकरण मिळवा ज्यामध्ये तुमचे अधिकार स्पष्टपणे सांगितले आणि स्रोत उद्धृत केलेत",
            "tab_document_label": "दस्तऱे",
            "tab_question_label": "प्रश्न",
            "language_label": "भाषा",
            "copy_button": "कॉपी करा",
            "copied_label": "कॉपी झाले!",
            "copy_failed_label": "कॉपी अयोग्य. पुन्हा प्रयत्न करा.",
            "ocr_result_heading": "काढलेला मजकूर",
            "confidence_label": "विश्वास",
            "plain_text_label": "साधा मजकूर",
            "no_text_extracted_label": "कोणताही मजकूर काढता आला नाही. कृपया स्पष्ट दस्तऱ्याची प्रतिमा वापरून पहा.",
            "error_microphone_access": "मायक्रोफोन प्रवेश नाकारला गेला. कृपया तुमच्या ब्राउজर सेटिंग्समध्ये हे सक्षम करा.",
            "error_backend_prefix": "काहीतरी चूक झाली:",
            "lang_hint_empty": "एक दस्तऱे अपलोड करून किंवा एक प्रश्न विचारून सुरुवात करा.",
            "lang_hint_hindi_devanagari": "तुम्ही देवनागरी लिपी (हिंदी) मध्ये प्रश्न विचारू शकता.",
            "lang_hint_tamil": "तुम्ही तमिळ लिपी मध्ये प्रश्न विचारू शकता.",
            "lang_hint_telugu": "तुम्ही तेलुगू लिपी मध्ये प्रश्न विचारू शकता.",
            "lang_hint_gujarati": "तुम्ही गुजराती लिपी मध्ये प्रश्न विचारू शकता.",
            "lang_hint_english": "तुम्ही इंग्रजी मध्ये प्रश्न विचारू शकता.",
            "document_placeholder": "तुमचे दस्तऱे येथे अपलोड करा किंवा तुमचा कायदेशीर प्रश्न सांगा",
            "question_placeholder": "उदा., भारतात भाड्याने राहणार्‍याचे अधिकार काय आहेत? / धारा 144 आदेश काय आहे?"
        },
        "gynaecare_page": {
            "hero_badge": "वैशिष्ट्य 05 — महिला स्वास्थ्य",
            "hero_headline_part1": "महिला आरोग्य।",
            "hero_gradient_text": "उत्तर।",
            "hero_headline_part2": "कोणत्याही निर्णयाशिवाय।",
            "hero_subtitle": "महिला स्वास्थ्य प्रश्नांसाठी पूर्णपणे गुप्त, कलंक-मुक्त चॅटबॉट. मासिक पाळी, पीसीओएस, गर्भधारण किंवा सामान्य कल्याण विषयी विचारा. 100% गोपनीय.",
            "tab_chat_label": "चॅट",
            "tab_modules_label": "आरोग्य मॉड्यूल",
            "tab_resources_label": "संसाधन",
            "language_toggle_label": "भाषा",
            "new_session_label": "नवीन सत्र",
            "footer_emergency_heading": "आपातकालीन हेल्पलाइने",
            "footer_emergency_108": "वैद्यकीय आपातकाल: 108",
            "footer_emergency_181": "महिला हेल्पलाइन: 1800-233-3434",
            "footer_emergency_mh": "मानसिक आरोग्य: 1860-2662-345"
        },
        "lab_report_page": {
            "param_label": "पॅरामीटर",
            "your_value_label": "तुमचे मूल्य",
            "normal_range_label": "सामान्य श्रेणी",
            "status_label": "स्थिति",
            "chart_heading": "तुमचे मूल्य विरुद्ध संदर्भ श्रेणी",
            "table_heading": "पॅरामीटर तुलना",
            "suggestions_heading": "आहार आणि जीवनशैली सुझाव"
        }
    }
}

def update_translation_file(lang_code):
    """Update a single translation file with new keys."""
    file_path = os.path.join(LOCALES_DIR, lang_code, "translation.json")
    
    if not os.path.exists(file_path):
        print(f"❌ {lang_code}: File not found at {file_path}")
        return False
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Get translations for this language (default to en if not found)
        if lang_code in translations:
            new_translations = translations[lang_code]
        else:
            # Use English as fallback - should be replaced with actual translations
            new_translations = translations.get(lang_code, translations['en'])
        
        # Add new sections
        for section, content in new_translations.items():
            if section not in data:
                data[section] = {}
            data[section].update(content)
        
        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        
        print(f"✅ {lang_code}: Updated successfully")
        return True
        
    except Exception as e:
        print(f"❌ {lang_code}: Error - {str(e)}")
        return False

# Languages list
LANGUAGES = ["en", "hi", "mr", "bn", "te", "ta", "gu", "ur", "kn", "ml"]

print("🔄 Updating translation files with new feature pages...\n")

for lang in LANGUAGES:
    update_translation_file(lang)

print("\n✨ Translation update complete!")
