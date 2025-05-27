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
    return `(${numbers.slice(0,3)}) ${numbers.slice(3,4)} ${numbers.slice(4)}`;
  } else {
    // (012) 9 1234-5678
    return `(${numbers.slice(0,3)}) ${numbers.slice(3,4)} ${numbers.slice(4,8)}-${numbers.slice(8,12)}`;
  }
};

export default function Search() {
  const [query, setQuery] = useState('');
  const [inputType, setInputType] = useState('text'); 
  const [isValid, setIsValid] = useState(null); 
  const [inputMode, setInputMode] = useState(null); 
  const debouncedQuery = useDebounce(query, 100);
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]); // Para sugestões de sobrenomes
  const [showSuggestions, setShowSuggestions] = useState(false); // Controla a exibição das sugestões
  const [firstName, setFirstName] = useState(''); // Armazena o primeiro nome para buscar sobrenomes
  const inputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar se está carregando
  const [isFocused, setIsFocused] = useState(false);
  const [preventBlur, setPreventBlur] = useState(false); // Novo estado para prevenir blur durante loading

  // Função para lidar com o foco do input
  const handleFocus = () => {
    setIsFocused(true);
  };

  // Função para lidar com a perda de foco do input
  // Modifique a função handleBlur para respeitar o estado preventBlur
  const handleBlur = (e) => {
    if (preventBlur) {
      // Se estiver em loading, previne o blur focando o input novamente
      e.preventDefault();
      if (inputRef.current) {
        setTimeout(() => inputRef.current.focus(), 10);
      }
      return;
    }

    // Comportamento normal (com delay para permitir cliques nas sugestões)
    setTimeout(() => {
      setIsFocused(false);
    }, 200);
  };

  // Na função handleKeyDown, bloqueie qualquer tecla que edite o texto
  const handleKeyDown = (e) => {
    if (isLoading) {
      // Bloqueia todas as teclas que podem editar o texto
      if (
        e.key === 'Backspace' ||
        e.key === 'Delete' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.ctrlKey ||  // Combinações com Ctrl
        e.metaKey     // Combinações com Command (Mac)
      ) {
        e.preventDefault();
        return false;
      }
    }
    
    // Se a tecla for Enter, trata a submissão da pesquisa
    if (e.key === 'Enter' && query.trim()) {
      handleSearchSubmit(e);
    }
  };

  const handleSearchChange = (e) => {
    // Se estiver carregando, não permite alterações
    if (isLoading) {
      return;
    }

    const inputValue = e.target.value;
    
    // Se o campo estiver vazio, reinicia o modo de entrada
    if (inputValue === '') {
      setQuery('');
      setInputMode(null);
      setInputType('text');
      setIsValid(null);
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    // Determina o modo com base no primeiro caractere
    const currentMode = inputMode || (/^\d/.test(inputValue) ? 'numeric' : /^[a-zA-ZÀ-ÿ]/.test(inputValue) ? 'letters' : null);
    
    // Se não conseguimos determinar o modo (caractere especial como primeiro), rejeita
    if (currentMode === null) {
      return;
    }
    
    // Se o modo mudou, atualize o estado
    if (inputMode === null) {
      setInputMode(currentMode);
      if (currentMode === 'letters') {
        setInputType('letters');
      }
    }
    
    // Processa a entrada com base no modo
    if (currentMode === 'numeric') {
      // Modo numérico: permite apenas números e símbolos de formatação
      const isValidNumericInput = /^[\d\s./()\-]*$/.test(inputValue);
      const hasNumbers = /\d/.test(inputValue.replace(/\D/g, ''));
      
      if (!isValidNumericInput || !hasNumbers) {
        // Rejeita caracteres não permitidos para números
        return;
      }
      
      // Se for entrada numérica válida, aplica a máscara
      const maskedValue = applyMask(inputValue);
      setQuery(maskedValue);
      
    } else if (currentMode === 'letters') {
      // Modo alfabético: permite apenas letras e espaços
      const isValidTextInput = /^[a-zA-ZÀ-ÿ\s]*$/.test(inputValue);
      
      if (!isValidTextInput) {
        // Rejeita caracteres não permitidos para texto
        return;
      }
      
      // Se for texto válido, aplica formatação de texto
      const formattedText = formatSearchText(inputValue);
      setQuery(formattedText);
      setInputType('letters');
      setIsValid(null);
      
      // Verifica se acabou de digitar um espaço
      const trimmedInput = formattedText.trim();
      
      // Checa se terminou de digitar o primeiro nome (espaço recém adicionado)
      if (formattedText.endsWith(' ') && !trimmedInput.includes(' ')) {
        console.log('Espaço detectado após o primeiro nome:', trimmedInput);
        setFirstName(trimmedInput);
        fetchSurnameSuggestions(trimmedInput);
      } else if (formattedText.includes(' ')) {
        // Já está digitando o sobrenome
        setShowSuggestions(false);
      }
    }
  };

  const handleSearchSubmit = async (e) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
      setIsLoading(true);
      
      try {
        // Sua lógica de busca aqui
        const response = await fetch(`/api/search?term=${encodeURIComponent(query.trim())}`);
        if (!response.ok) {
          throw new Error('Falha na busca');
        }
        
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Erro durante a busca:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Função original para formatar texto (primeira letra maiúscula)
  const formatSearchText = (text) => {
    return text
      .split(' ')
      .map(word => {
        if (word.length > 2) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word.toLowerCase();
      })
      .join(' ');
  };

  // Função para detectar tipo e aplicar máscara apropriada
  const applyMask = (value) => {
    // Remove formatação existente
    const cleanValue = value.replace(/\D/g, '');
    
    // Limita a entrada a 14 dígitos (máximo para CNPJ)
    const limitedValue = cleanValue.slice(0, 14);
  
    // Se tiver menos de 4 dígitos, não aplica máscara ainda
    if (limitedValue.length < 4) {
      setInputType('text');
      setIsValid(null); // não mostra cor
      return limitedValue;
    }
  
    // Verifica se é um celular pelo padrão 0XX9... (começa com 0 e 4º dígito é 9)
    if (limitedValue.charAt(0) === '0' && limitedValue.charAt(3) === '9') {
      setInputType('celular');
      const isCelularValid = isValidCelular(limitedValue);
      // Alterado para >= para manter a cor mesmo com tentativas de adicionar caracteres extras
      setIsValid(limitedValue.length >= 12 ? isCelularValid : null);
      return maskCelular(limitedValue);
    } 
  
    // O mesmo ajuste pode ser feito para CPF e CNPJ para consistência
    if (limitedValue.length <= 11) {
      // Formata como CPF
      setInputType('cpf');
      const isCPFValid = isValidCPF(limitedValue);
      setIsValid(limitedValue.length === 11 ? isCPFValid : null);
      return maskCPF(limitedValue);
    } else {
      // Formata como CNPJ se passar de 11 dígitos (12 ou mais)
      setInputType('cnpj');
      const isCNPJValid = isValidCNPJ(limitedValue);
      setIsValid(limitedValue.length >= 14 ? isCNPJValid : null);
      return maskCNPJ(limitedValue);
    }
  };

  // Função para aplicar a sugestão de sobrenome
  const applySuggestion = (suggestion) => {
    setQuery(suggestion.fullName);
    setSuggestions([]);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Modifique a função fetchSurnameSuggestions para controlar o estado preventBlur
  const fetchSurnameSuggestions = async (name) => {
    try {
      setIsLoading(true);
      setPreventBlur(true); // Previne o blur enquanto carrega
      
      // Armazene o nome atual para usar nas sugestões
      const currentSearchName = name;
  
      const response = await fetch(`/api/surname-suggestions?firstName=${encodeURIComponent(name)}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar sugestões');
      }
      
      const data = await response.json();
      
      // Use currentSearchName em vez de firstName
      const enhancedData = data.map(surname => ({
        fullName: `${currentSearchName} ${surname}`, // <-- CORREÇÃO AQUI
        surname,
        description: `${['Brasiliense', 'Paulista', 'Carioca', 'Mineiro'][Math.floor(Math.random() * 4)]} de ${20 + Math.floor(Math.random() * 40)} anos`,
        avatarUrl: 'https://placehold.co/100'
      }));
      
      setSuggestions(enhancedData);
      setShowSuggestions(enhancedData.length > 0);
      
      // Atualizar o firstName para uso futuro
      setFirstName(currentSearchName);
      
      // Garante que o input mantenha o foco após o loading
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error('Erro ao buscar sugestões de sobrenomes:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
      // Pequeno delay antes de permitir blur novamente para garantir que as sugestões apareçam
      setTimeout(() => {
        setPreventBlur(false);
        // Refocus explícito para garantir que o input ainda tem foco
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  // Determina a classe CSS com base na validade
  const getInputClass = () => {
    if (isValid === null || (inputType !== 'cpf' && inputType !== 'cnpj' && inputType !== 'celular')) return '';
    return isValid ? 'valid-format' : 'invalid-format';
  };

  useEffect(() => {
    if (debouncedQuery.trim() !== "") {
      // Busca na API
      fetch(`/api/search?term=${debouncedQuery}`)
        .then(res => res.json())
        .then(data => setResults(data))
        .catch(err => {
          console.error(err);
          setResults([]);
        });
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  return (
    <div className="search-wrapper">
      {/* Altere a condição aqui para só ativar quando realmente houver sugestões */}
      <div className={`search-container ${showSuggestions && suggestions.length > 0 && isFocused ? 'with-suggestions' : ''}`}>
        <div className="search-icon">
          <SearchIcon />
        </div>
        <input
          ref={inputRef}
          type="text"
          className={`search-input ${getInputClass()} ${isLoading ? 'loading' : ''}`}
          value={query}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Quem você quer encontrar?"
          disabled={isLoading} 
        />
        {query && (
          isLoading ? (
            <div className="loader" role="status" aria-label="Carregando">
              <svg className="circular" viewBox="25 25 50 50">
                <circle className="path" cx="50" cy="50" r="20" fill="none" strokeWidth="2" strokeMiterlimit="10"/>
              </svg>
            </div>
          ) : (
            <button 
              className="clear-button" 
              onClick={() => {
                setQuery('');
                setInputType('text');
                setIsValid(null);
                setInputMode(null);
                setSuggestions([]);
                setShowSuggestions(false);
              }}
            >
              <svg viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          )
        )}
      </div>
      
      {/* Coloque as sugestões logo após o search-container para o efeito visual conectado */}
      {(showSuggestions && suggestions.length > 0 && (isFocused || isLoading)) && (
        <div className="search-suggestions">
          <div className="suggestions-header"></div>
          {suggestions.map((suggestion, index) => (
            <div 
              key={index} 
              className="suggestion-item" 
              onClick={() => applySuggestion(suggestion)}
            >
              <div 
                className="suggestion-avatar" 
                style={{ backgroundImage: `url(${suggestion.avatarUrl})` }}
              ></div>
              <div className="suggestion-content">
                <div className="suggestion-name">{suggestion.fullName}</div>
                <div className="suggestion-description">{suggestion.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Resultados da busca */}
      {results.length > 0 && !showSuggestions && (
        <div className="search-results">
          {results.map(user => (
            <div key={user.id} className="search-result-item">
              {user.nome}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}