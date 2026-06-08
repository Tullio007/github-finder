// GitHub Finder — busca o perfil e os repositórios de um usuário do GitHub.
// Estrutura: Config -> Referências de DOM -> Helpers -> API -> Render ->
// Controlador -> Inicialização. Encapsulado em IIFE para não poluir o escopo global.

(() => {
  "use strict";

  /* ---------- Config ---------- */
  const API_BASE = "https://api.github.com/users";
  const TOTAL_REPOS = 6; // últimos repositórios exibidos
  const MENSAGENS = {
    vazio: "Digite um nome de usuário para buscar.",
    buscando: "Buscando...",
    naoEncontrado: "Perfil não encontrado.",
    erroApi: "Não foi possível concluir a busca. Tente novamente.",
    erroRede: "Não foi possível conectar. Verifique sua internet e tente novamente.",
    semRepos: "Este usuário não possui repositórios públicos.",
  };

  /* ---------- Referências de DOM ---------- */
  const form = document.getElementById("form-busca");
  const campo = document.getElementById("campo-usuario");
  const botao = document.getElementById("botao-buscar");
  const aviso = document.getElementById("aviso");
  const resultado = document.getElementById("resultado");
  const avatar = document.getElementById("avatar");
  const nome = document.getElementById("nome");
  const login = document.getElementById("login");
  const bio = document.getElementById("bio");
  const listaRepos = document.getElementById("lista-repos");

  /* ---------- Helpers ---------- */
  const exibir = (el) => el.classList.remove("is-hidden");
  const ocultar = (el) => el.classList.add("is-hidden");

  function mostrarAviso(mensagem) {
    aviso.textContent = mensagem;
    exibir(aviso);
  }

  // Reseta a tela para o estado inicial antes de cada nova busca.
  function limparTela() {
    aviso.textContent = "";
    ocultar(aviso);
    ocultar(resultado);
    listaRepos.innerHTML = "";
  }

  /* ---------- API ---------- */
  const buscarPerfil = (usuario) =>
    fetch(`${API_BASE}/${encodeURIComponent(usuario)}`);

  const buscarRepos = (usuario) =>
    fetch(`${API_BASE}/${encodeURIComponent(usuario)}/repos?per_page=100`);

  /* ---------- Render ---------- */
  function renderizarPerfil(usuario) {
    avatar.src = usuario.avatar_url;
    avatar.alt = `Foto de perfil de ${usuario.name || usuario.login}`;
    nome.textContent = usuario.name || usuario.login;
    login.textContent = `@${usuario.login}`;
    login.href = usuario.html_url;

    if (usuario.bio) {
      bio.textContent = usuario.bio;
      exibir(bio);
    } else {
      bio.textContent = "";
      ocultar(bio);
    }

    exibir(resultado);
  }

  // Cria o card de um repositório via DOM API (textContent evita injeção
  // de HTML a partir de nomes de repositório controlados pelo usuário).
  function criarCardRepo(repo) {
    const card = document.createElement("a");
    card.className = "repo-card";
    card.href = repo.html_url;
    card.target = "_blank";
    card.rel = "noopener";

    const titulo = document.createElement("span");
    titulo.className = "repo-card__name";
    titulo.textContent = repo.name;

    const meta = document.createElement("div");
    meta.className = "repo-card__meta";

    const linguagem = document.createElement("span");
    linguagem.textContent = repo.language || "—";

    const estrelas = document.createElement("span");
    estrelas.textContent = `★ ${repo.stargazers_count}`;

    meta.append(linguagem, estrelas);
    card.append(titulo, meta);
    return card;
  }

  // Percorre o array de repositórios (forEach) e gera os cards.
  function renderizarRepositorios(repos) {
    listaRepos.innerHTML = "";

    if (repos.length === 0) {
      const vazio = document.createElement("p");
      vazio.className = "repos__empty";
      vazio.textContent = MENSAGENS.semRepos;
      listaRepos.appendChild(vazio);
      return;
    }

    repos
      .slice() // cópia para não mutar o array original
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, TOTAL_REPOS)
      .forEach((repo) => listaRepos.appendChild(criarCardRepo(repo)));
  }

  /* ---------- Controlador ---------- */
  async function buscar(usuario) {
    botao.disabled = true;
    mostrarAviso(MENSAGENS.buscando);

    try {
      const respostaPerfil = await buscarPerfil(usuario);

      if (respostaPerfil.status === 404) {
        limparTela();
        mostrarAviso(MENSAGENS.naoEncontrado);
        return;
      }

      if (!respostaPerfil.ok) {
        limparTela();
        mostrarAviso(MENSAGENS.erroApi);
        return;
      }

      const perfil = await respostaPerfil.json();

      // Segunda requisição: repositórios do usuário.
      const respostaRepos = await buscarRepos(usuario);
      const repos = respostaRepos.ok ? await respostaRepos.json() : [];

      ocultar(aviso);
      renderizarPerfil(perfil);
      renderizarRepositorios(repos);
    } catch {
      limparTela();
      mostrarAviso(MENSAGENS.erroRede);
    } finally {
      botao.disabled = false;
    }
  }

  /* ---------- Inicialização ---------- */
  form.addEventListener("submit", (evento) => {
    evento.preventDefault(); // evita o reload padrão do formulário

    const valor = campo.value.trim();

    // Validação: campo vazio interrompe a busca imediatamente.
    if (!valor) {
      limparTela();
      mostrarAviso(MENSAGENS.vazio);
      return;
    }

    buscar(valor);
  });
})();
