import React, { useState, useEffect, useRef } from 'react';
import SearchIcon from './SearchIcon';
import useDebounce from './hooks/useDebounce';

// Função para validar CPF com suporte para entrada com excesso
const isValidCPF = (cpf) => {
  if (!cpf) return false;
  
  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');
  
  // Se for maior que 11, considere apenas os primeiros 11 dígitos para validação
  const cpfParaValidar = cpf.length > 11 ? cpf.substring(0, 11) : cpf;
  
  if (cpfParaValidar.length !== 11) return false;
  
  // Verifica CPFs com dígitos repetidos
  if (/^(\d)\1{10}$/.test(cpfParaValidar)) return false;
  
  // Calcula o primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfParaValidar.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  const dv1 = resto > 9 ? 0 : resto;
  
  // Calcula o segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfParaValidar.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  const dv2 = resto > 9 ? 0 : resto;
  
  return parseInt(cpfParaValidar.charAt(9)) === dv1 && parseInt(cpfParaValidar.charAt(10)) === dv2;
};

// Função para validar CNPJ com suporte para entrada com excesso
const isValidCNPJ = (cnpj) => {
  if (!cnpj) return false;
  
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/\D/g, '');
  // Se for maior que 14, considere apenas os primeiros 14 dígitos para validação
  const cnpjParaValidar = cnpj.length > 14 ? cnpj.substring(0, 14) : cnpj;
  
  if (cnpjParaValidar.length !== 14) return false;
  
  // Verifica CNPJs com dígitos repetidos
  if (/^(\d)\1{13}$/.test(cnpjParaValidar)) return false;
  
  // Resto do código de validação do CNPJ...
  let tamanho = cnpjParaValidar.length - 2;
  let numeros = cnpjParaValidar.substring(0, tamanho);
  const digitos = cnpjParaValidar.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  // Calcula o segundo dígito verificador
  tamanho = tamanho + 1;
  numeros = cnpjParaValidar.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1));
};

// Função para validar celular com suporte para entrada com excesso
const isValidCelular = (celular) => {
  if (!celular) return false;
  
  // Remove caracteres não numéricos
  celular = celular.replace(/\D/g, '');
  // Se for maior que 12, considere apenas os primeiros 12 dígitos para validação
  const celularParaValidar = celular.length > 12 ? celular.substring(0, 12) : celular;
  
  return celularParaValidar.length === 12 && 
         celularParaValidar.charAt(0) === '0' && 
         celularParaValidar.charAt(3) === '9';
};

// NOVA FUNÇÃO: Função para validar Email
const isValidEmail = (email) => {
  if (!email) return false;
  // Regex para validar estrutura de email, permitindo os caracteres especificados: a-z, A-Z, 0-9, @, ., _, -
  // A parte local e o domínio podem conter . e -
  // O TLD deve ter pelo menos 2 letras.
  const emailRegex = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  return emailRegex.test(email);
};

// Função para aplicar máscara CPF
const maskCPF = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

// Função para aplicar máscara CNPJ
const maskCNPJ = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

// Função para aplicar máscara Celular - formatação progressiva
const maskCelular = (value) => {
  const numbers = value.replace(/\D/g, '');
  
  // Aplicar formatação progressiva de acordo com o número de dígitos
  if (numbers.length <= 1) {
    // (0
    return `(${numbers}`;
  } else if (numbers.length <= 3) {
    // (012
    return `(${numbers}`;
  } else if (numbers.length <= 4) {
    // (012) 9
    return `(${numbers.slice(0,3)}) ${numbers.slice(3)}`;
  } else if (numbers.length <= 8) {
    // (012) 9 1234
    return `(${numbers.slice(0,3)}) ${numbers.slice(3,4)} ${numbers.slice(4,8)}`;
  } else {
    // (012) 9 1234-5678 (limita a 12 dígitos numéricos para celular)
    return `(${numbers.slice(0,3)}) ${numbers.slice(3,4)} ${numbers.slice(4,8)}-${numbers.slice(8,12)}`;
  }
};


export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputType, setInputType] = useState('text'); // text, cpf, cnpj, celular, email, letters
  const [isValid, setIsValid] = useState(null); // true, false, ou null (sem validação/cor)
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputMode, setInputMode] = useState(null); // 'numeric', 'letters', 'email', ou null
  const [preventBlur, setPreventBlur] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);


  const inputRef = useRef(null);

  // Debounce para busca de sobrenomes
  const debouncedFetchSurnameSuggestions = useDebounce(fetchSurnameSuggestions, 300);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleKeyDown = (e) => {
    if (isLoading) {
      e.preventDefault();
      return;
    }

    // Permite Backspace, Delete, setas, Tab, Ctrl/Cmd + A, C, V, X
    if (
      e.key === 'Backspace' ||
      e.key === 'Delete' ||
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight' ||
      e.key === 'Tab' ||
      ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()))
    ) {
      return; // Não previne o default para estas teclas de edição/navegação
    }

    // Se o modo for 'email', permite apenas os caracteres válidos para email.
    // Isso oferece um feedback mais imediato ao usuário, complementando a filtragem em onChange.
    if (inputMode === 'email') {
      if (!/^[a-zA-Z0-9@._-]$/.test(e.key) && e.key.length === 1) { // e.key.length === 1 para ignorar Enter, Shift, etc.
        e.preventDefault(); // Previne a inserção do caractere inválido
        return;
      }
    }
    // Para outros modos, a filtragem principal e mais robusta ocorre em handleSearchChange.
    // Não é estritamente necessário bloquear aqui, pois handleSearchChange corrigirá.

    // Se a tecla for Enter, trata a submissão da pesquisa
    if (e.key === 'Enter' && query.trim()) {
      handleSearchSubmit(e);
    }
  };

  const handleSearchChange = (e) => {
    if (isLoading) {
      return;
    }

    const currentValue = e.target.value;

    if (currentValue === '') {
      setQuery('');
      setInputMode(null);
      setInputType('text');
      setIsValid(null);
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    let nextQuery = currentValue;
    let nextInputMode = inputMode;
    let nextInputType = inputType;
    let nextIsValid = null; 
    let forceHideSuggestions = false;

    // Prioridade 1: Modo Email
    // Se já está no modo email ou se o valor contém '@'
    if (inputMode === 'email' || currentValue.includes('@')) {
      if (inputMode !== 'email') { // Transição para o modo email
        nextInputMode = 'email';
      } else {
        nextInputMode = 'email'; // Mantém modo email
      }
      nextInputType = 'email';
      
      let filteredEmail = '';
      for (const char of currentValue) {
        // Permitir apenas os caracteres especificados: a-z, A-Z, 0-9, @, ., _, -
        if (/[a-zA-Z0-9@._-]/.test(char)) {
          filteredEmail += char;
        }
      }
      nextQuery = filteredEmail.toLowerCase(); // E-mails são geralmente case-insensitive e armazenados em minúsculas
      nextIsValid = isValidEmail(nextQuery);
      forceHideSuggestions = true;

    } else {
      // Prioridade 2: Modo Numérico ou Letras (se não for email)
      const trimmedValue = currentValue.trimLeft(); // Considera o valor sem espaços à esquerda para determinar o tipo
      const firstSignificantChar = trimmedValue.charAt(0);

      if (/^\d$/.test(firstSignificantChar) || (inputMode === 'numeric' && trimmedValue !== "")) {
        // Se o primeiro caractere significativo for um número, ou se já estava no modo numérico
        nextInputMode = 'numeric';
        // applyMask é responsável por limpar não numéricos, aplicar a máscara (CPF, CNPJ, Celular),
        // e também por chamar setInputType e setIsValid internamente.
        nextQuery = applyMask(currentValue); 
        // Como applyMask atualiza inputType e isValid, não precisamos definir nextInputType e nextIsValid aqui.
        forceHideSuggestions = true;

      } else if (/^[a-zA-ZÀ-ÿ]$/.test(firstSignificantChar) || (inputMode === 'letters' && trimmedValue !== "")) {
        // Se o primeiro caractere significativo for uma letra, ou se já estava no modo letras
        nextInputMode = 'letters';
        nextInputType = 'letters'; 
        
        let filteredText = '';
        for (const char of currentValue) {
          if (/[a-zA-ZÀ-ÿ\s]/.test(char)) { // Permite apenas letras (incluindo acentuadas) e espaços
            filteredText += char;
          }
        }
        // formatSearchText capitaliza a primeira letra de palavras com mais de 2 caracteres
        nextQuery = formatSearchText(filteredText);
        nextIsValid = null; // Nenhuma validação específica para 'nome' (isValid true/false) neste ponto

        // Lógica para buscar sugestões de sobrenome
        const trimmedQueryForSuggestions = nextQuery.trim();
        if (trimmedQueryForSuggestions.includes(' ') && trimmedQueryForSuggestions.length > 2 && !isLoadingSuggestions) {
          debouncedFetchSurnameSuggestions(trimmedQueryForSuggestions);
          // setShowSuggestions(true) será chamado dentro de fetchSurnameSuggestions ou seu callback
        } else {
          forceHideSuggestions = true; 
        }
      } else {
        // Se não for email, nem começar com número ou letra (ex: caractere especial isolado, ou campo misto não previsto)
        // Tratar como texto genérico, sem formatação ou validação específica.
        nextInputMode = null; // Indica um modo genérico/texto simples
        nextInputType = 'text';
        nextQuery = currentValue; // Mantém o valor como está, sem filtros adicionais aqui
        nextIsValid = null;
        forceHideSuggestions = true;
      }
    }

    setQuery(nextQuery);

    if (inputMode !== nextInputMode) {
      setInputMode(nextInputMode);
    }

    // Atualiza inputType e isValid, exceto se o modo for numérico (onde applyMask já o fez)
    if (nextInputMode !== 'numeric') {
      if (inputType !== nextInputType) {
        setInputType(nextInputType);
      }
      if (isValid !== nextIsValid) {
        setIsValid(nextIsValid);
      }
    }
    
    if (forceHideSuggestions) {
        setSuggestions([]);
        setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) {
      return;
    }

    setIsLoading(true);
    setResults([]); // Limpa resultados anteriores
    setSuggestions([]); // Esconde sugestões
    setShowSuggestions(false);

    // Simulação de chamada de API
    try {
      // Substitua pelo seu endpoint de busca real
      // const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${inputType}`);
      // const data = await response.json();
      // setResults(data);
      console.log('Buscando por:', query, 'Tipo:', inputType, 'Modo:', inputMode, 'Válido:', isValid);
      // Simulação
      setTimeout(() => {
        setResults([{ id: 1, name: `Resultado para "${query}"` }]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro durante a busca:', error);
      setResults([]);
      setIsLoading(false);
    }
  };

  // Função original para formatar texto (primeira letra maiúscula de palavras > 2 chars)
  const formatSearchText = (text) => {
    return text
      .split(' ')
      .map(word => {
        if (word.length > 2) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        // Palavras com 2 ou menos caracteres ficam em minúsculas (ou como estão, se preferir)
        // Para manter consistência com a capitalização, pode-se optar por word.toLowerCase()
        // ou simplesmente `return word;` se não quiser alterá-las.
        // O original era word.toLowerCase().
        return word.toLowerCase(); 
      })
      .join(' ');
  };

  // Função para detectar tipo e aplicar máscara apropriada (CPF, CNPJ, Celular)
  // Esta função também chama setInputType e setIsValid como efeitos colaterais.
  const applyMask = (value) => {
    const cleanValue = value.replace(/\D/g, ''); // Remove formatação existente, pega só números
    const limitedValue = cleanValue.slice(0, 14); // Limita a 14 dígitos (máximo para CNPJ)
  
    if (limitedValue.length < 4) {
      setInputType('text'); // Poucos dígitos, ainda não é possível determinar o tipo específico
      setIsValid(null); 
      return limitedValue; // Retorna os números limpos, sem máscara
    }
  
    // Verifica se é um celular pelo padrão 0XX9... (começa com 0, 4º dígito é 9)
    // Considerando que o DDD tem 3 dígitos (ex: 011), o 4º dígito do número completo (0+DDD+Numero) seria o primeiro do número em si.
    // A validação original era `limitedValue.charAt(0) === '0' && limitedValue.charAt(3) === '9'`
    // Isso implica que o DDD tem 3 dígitos (ex: 0XX). Se o DDD tiver 2 (XX), seria charAt(2) === '9'.
    // Vamos manter a lógica original, assumindo DDD de 3 dígitos para celular iniciado com 0.
    if (limitedValue.startsWith('0') && limitedValue.length >= 4 && limitedValue.charAt(3) === '9') {
      setInputType('celular');
      const isCelularValid = isValidCelular(limitedValue);
      // Valida se tem pelo menos 12 dígitos para ser considerado "completo" para validação.
      setIsValid(limitedValue.length >= 12 ? isCelularValid : null); 
      return maskCelular(limitedValue);
    } 
  
    // Se não for celular, verifica se é CPF ou CNPJ
    if (limitedValue.length <= 11) {
      setInputType('cpf');
      const isCPFValid = isValidCPF(limitedValue);
      setIsValid(limitedValue.length === 11 ? isCPFValid : null); // CPF é válido apenas com 11 dígitos
      return maskCPF(limitedValue);
    } else { // 12 ou mais dígitos, e não é celular -> trata como CNPJ
      setInputType('cnpj');
      const isCNPJValid = isValidCNPJ(limitedValue);
      setIsValid(limitedValue.length >= 14 ? isCNPJValid : null); // CNPJ é válido com 14 dígitos
      return maskCNPJ(limitedValue);
    }
  };

  // Função para aplicar a sugestão de sobrenome
  const applySuggestion = (suggestion) => {
    // Ao aplicar a sugestão, o modo deve ser 'letters'
    setInputMode('letters');
    setInputType('letters');
    setQuery(suggestion.fullName); // fullName já deve estar formatado por formatSearchText se necessário
    setIsValid(null); // Validação de nome não é feita aqui
    setSuggestions([]);
    setShowSuggestions(false);
    setPreventBlur(false); // Permite o blur após aplicar
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  async function fetchSurnameSuggestions(namePart) {
    if (!namePart.includes(' ') || namePart.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsLoadingSuggestions(true);
    setPreventBlur(true); // Previne o blur enquanto carrega sugestões

    // Simulação de API para sugestões de sobrenome
    console.log('Buscando sugestões para:', namePart);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay da API
      const mockSuggestions = [
        { id: '1', fullName: `${namePart} Silva` },
        { id: '2', fullName: `${namePart} Santos` },
        { id: '3', fullName: `${namePart} Oliveira` },
      ].filter(sugg => sugg.fullName.toLowerCase().startsWith(namePart.toLowerCase()));

      if (mockSuggestions.length > 0) {
        setSuggestions(mockSuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Erro ao buscar sugestões de sobrenome:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
      // Não setar preventBlur para false aqui, pois o usuário pode estar clicando
      // Deixar o onBlur do input lidar com isso se não for um clique na sugestão.
      // Ou o applySuggestion lida com isso.
    }
  }
  
  const handleInputBlur = () => {
    // Atraso para permitir cliques nas sugestões antes de esconder
    if (!preventBlur) {
        setTimeout(() => {
            setShowSuggestions(false);
        }, 100); // Ajuste o tempo conforme necessário
    }
  };


  return (
    <div className="search-container">
      <form onSubmit={handleSearchSubmit} className="search-form">
        <div className={`search-input-wrapper ${isLoading ? 'loading' : ''} ${isValid === true ? 'valid' : isValid === false ? 'invalid' : ''}`}>
          <SearchIcon className="search-input-icon" />
          <input
            ref={inputRef}
            type="text" // Sempre text, o comportamento é controlado via JS
            value={query}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onBlur={handleInputBlur}
            onFocus={() => {
                // Se houver sugestões e o campo tiver foco, mostre-as
                // (exceto se estiver no modo email ou numérico)
                if (inputMode === 'letters' && suggestions.length > 0 && query.includes(' ')) {
                    setShowSuggestions(true);
                }
                setPreventBlur(false); // Reseta o preventBlur ao focar
            }}
            placeholder="Nome, CPF, CNPJ, Celular ou Email"
            className="search-input"
            disabled={isLoading}
          />
          {isLoading && <div className="spinner"></div>}
        </div>
        <button type="submit" className="search-button" disabled={isLoading || !query.trim()}>
          Buscar
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul 
            className="suggestions-list"
            onMouseDown={() => setPreventBlur(true)} // Previne o blur ao clicar na lista
            onMouseUp={() => setPreventBlur(false)} // Libera o preventBlur após o clique
        >
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              onClick={() => applySuggestion(suggestion)}
              className="suggestion-item"
            >
              {suggestion.fullName}
            </li>
          ))}
        </ul>
      )}

      {results.length > 0 && (
        <div className="results-container">
          <h3>Resultados:</h3>
          <ul>
            {results.map((result) => (
              <li key={result.id}>{result.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}