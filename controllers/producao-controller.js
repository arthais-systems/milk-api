const AssyncHandler = require("express-async-handler");
const Fazendeiro = require("../models/Fazendeiro");
const Fazenda = require("../models/Fazenda");
const Producao = require("../models/Producao");

function validade(req, res) {
  if (!req.body.fazendeiro) {
    res.status(400).json({
      description: "O campo [fazendeiro] deve ser preenchido!",
    });
  }

  const fazendeiroTemp = Fazendeiro.findByPk(String(req.body.fazendeiro));
  if (!fazendeiroTemp) {
    res.status(400).json({
      description: "Fazendeiro não encontrado!",
    });
  }

  if (!req.body.fazenda) {
    res.status(400).json({
      description: "O campo [fazenda] deve ser preenchido!",
    });
  }

  const fazendaTemp = Fazenda.findByPk(String(req.body.fazenda));
  if (!fazendaTemp) {
    res.status(400).json({
      description: "Fazenda não encontrada!",
    });
  }

  if (fazendaTemp.fazendeiro !== fazendeiroTemp._id) {
    res.status(400).json({
      description: "Fazenda não pertence ao fazendeiro!",
    });
  }

  if (!req.body.dataProducao) {
    res.status(400).json({
      description: "O campo [dataProducao] deve ser preenchido!",
    });
  }

  if (
    String(req.body.dataProducao)
      .toLowerCase()
      .match(/^\d{4}[\-](0?[1-9]|1[012])[\-](0?[1-9]|[12][0-9]|3[01])$/)
  ) {
    res.status(400).json({
      description: `O campo [dataProducao] possui um conteúdo inválido: ${req.body.dataProducao}!`,
    });
  }

  if (!req.body.litrosProduzidos) {
    res.status(400).json({
      description: "O campo [litrosProduzidos] deve ser preenchido!",
    });
  }

  if (!isNumeric(String(req.body.litrosProduzidos).replaceAll(",", "."))) {
    res.status(400).json({
      description: "O campo [litrosProduzidos] deve conter um valor numérico!",
    });
  }

  if (
    parseFloat(req.body.litrosProduzidos) < 1 ||
    parseFloat(req.body.litrosProduzidos) > 200000
  ) {
    res.status(400).json({
      description: "O campo [litrosProduzidos] contem um valor fora dos limites esperados: 1 <= litrosProduzidos <= 200000!",
    });
  }
}

function buildMap(req) {
  const producaoMap = {
    _id: req.body.id ? String(req.body.id) : undefined,
    fazendeiro: String(req.body.fazendeiro),
    fazenda: String(req.body.fazenda),
    dataProducao: new Date(req.body.dataProducao).toISOString,
    litrosProduzidos: parseFloat(req.body.litrosProduzidos),
  };

  return producaoMap;
}

const createProducao = AssyncHandler(async (req, res) => {
  if (req.body.id) {
    res.status(400).json({
      description: "O campo [id] não deve ser preenchido!",
    });
  }
  validade(req, res);

  const producaoMap = buildMap(req);

  const producao = await Producao.create(producaoMap, { new: true });

  res.status(200).json({
    description: "Dados da produção de leite salvos com sucesso!",
    data: producao,
  });
});

const updateProducao = AssyncHandler(async (req, res) => {
  if (!req.body.id) {
    res.status(400).json({
      description: "O campo [id] deve ser preenchido!",
    });
  }
  validade(req, res);

  const producaoMap = buildMap(req);

  // TODO: verificar qual o valor retornado quando não existe um registro com o _id especificado.
  const producao = await Producao.update(
    producaoMap,
    {
      where: { id: producaoMap._id },
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    description: "Dados da produção de leite atualizados com sucesso!",
    data: producao,
  });
});

const deleteProducao = AssyncHandler(async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({
      description: "O parâmetro [id] deve ser preenchido!",
    });
  }

  const id = String(req.params.id);

  // TODO: verificar qual o valor retornado quando não existe um registro com o _id especificado.
  const producao = await Producao.destroy({
    where: { id: id },
  });

  res.status(200).json({
    description: "Produção de leite excluída com sucesso!",
    data: producao,
  });
});

const findProducaoById = AssyncHandler(async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({
      description: "O parâmetro [id] deve ser preenchido!",
    });
  }

  const id = String(req.params.id);

  const producao = await Producao.findByPk(id);

  res.status(200).json({
    description: "Produção de leite obtida com sucesso!",
    data: producao,
  });
});

const findProducoesByDataProducaoInicialAndDataProducaoFinal = AssyncHandler(async (req, res) => {
  if (!req.params.dataProducaoInicial) {
    res.status(400).json({
      description: "O parâmetro [dataProducaoInicial] deve ser preenchido!",
    });
  }
  if (
    String(req.params.dataProducaoInicial)
      .toLowerCase()
      .match(/^\d{4}[\-](0?[1-9]|1[012])[\-](0?[1-9]|[12][0-9]|3[01])$/)
  ) {
    res.status(400).json({
      description: `O parâmetro [dataProducaoInicial] possui um conteúdo inválido: ${req.params.dataProducao}!`,
    });
  }
  if (!req.params.dataProducaoFinal) {
    res.status(400).json({
      description: "O parâmetro [dataProducaoFinal] deve ser preenchido!",
    });
  }
  if (
    String(req.params.dataProducaoFinal)
      .toLowerCase()
      .match(/^\d{4}[\-](0?[1-9]|1[012])[\-](0?[1-9]|[12][0-9]|3[01])$/)
  ) {
    res.status(400).json({
      description: `O parâmetro [dataProducaoFinal] possui um conteúdo inválido: ${req.params.dataProducaoFinal}!`,
    });
  }

  const dataProducaoInicial = new Date(req.params.dataProducaoInicial).toISOString();
  const dataProducaoFinal = new Date(req.params.dataProducaoFinal).toISOString();

  if (new Date(dataProducaoInicial).getTime > new Date(dataProducaoFinal).getTime) {
    res.status(400).json({
      description: "Período inválido: o valor do parâmetro [dataProducaoInicial] não pode ser maior que o valor do parâmetro [dataProducaoFinal]!",
    });
  }

  const producaoList = await Producao.find({
    dataProducao: { $gte: dataProducaoInicial, $lte: dataProducaoFinal },
  });

  res.status(200).json({
    description: "Dados das produções de leite obtidos com sucesso!",
    data: producaoList,
  });
});

const findProducoesByFazendaAndDataProducaoInicialAndDataProducaoFinal = AssyncHandler(async (req, res) => {
  if (!req.params.fazenda) {
    res.status(400).json({
      description: "O parâmetro [fazenda] deve ser preenchido!",
    });
  }
  if (!req.params.dataProducaoInicial) {
    res.status(400).json({
      description: "O parâmetro [dataProducaoInicial] deve ser preenchido!",
    });
  }
  if (
    String(req.params.dataProducaoInicial)
      .toLowerCase()
      .match(/^\d{4}[\-](0?[1-9]|1[012])[\-](0?[1-9]|[12][0-9]|3[01])$/)
  ) {
    res.status(400).json({
      description: `O parâmetro [dataProducaoInicial] possui um conteúdo inválido: ${req.params.dataProducao}!`,
    });
  }
  if (!req.params.dataProducaoFinal) {
    res.status(400).json({
      description: "O parâmetro [dataProducaoFinal] deve ser preenchido!",
    });
  }
  if (
    String(req.params.dataProducaoFinal)
      .toLowerCase()
      .match(/^\d{4}[\-](0?[1-9]|1[012])[\-](0?[1-9]|[12][0-9]|3[01])$/)
  ) {
    res.status(400).json({
      description: `O parâmetro [dataProducaoFinal] possui um conteúdo inválido: ${req.params.dataProducaoFinal}!`,
    });
  }

  const fazenda = String(req.params.fazenda);
  const dataProducaoInicial = new Date(req.params.dataProducaoInicial).toISOString();
  const dataProducaoFinal = new Date(req.params.dataProducaoFinal).toISOString();

  if (new Date(dataProducaoInicial).getTime > new Date(dataProducaoFinal).getTime) {
    res.status(400).json({
      description: "Período inválido: o valor do parâmetro [dataProducaoInicial] não pode ser maior que o valor do parâmetro [dataProducaoFinal]!",
    });
  }

  // TODO: verificar qual o valor retornado quando não existem registros que atandam a seleção.
  const producaoList = await Producao.find({
    fazenda: fazenda,
    dataProducao: { $gte: dataProducaoInicial, $lte: dataProducaoFinal },
  });

  res.status(200).json({
    description: "Dados das produções de leite obtidos com sucesso!",
    data: producaoList,
  });
});

const findProducoesByFazendaAndAnoAndMes = AssyncHandler(async (req, res) => {
  const producaoList = [];

  res.status(200).json({
    description: "Dados das produções de leite obtidos com sucesso!",
    data: producaoList,
  });
});

const findProducoesMensaisByFazendaAndAno = AssyncHandler(async (req, res) => {
  const producaoList = [];

  res.status(200).json({
    description: "Dados das produções de leite obtidos com sucesso!",
    data: producaoList,
  });
});

const findProducoesByFazendeiroAndDataProducaoInicialAndDataProducaoFinal = AssyncHandler(async (req, res) => {
  if (!req.params.fazendeiro) {
    res.status(400).json({
      description: "O parâmetro [fazendeiro] deve ser preenchido!",
    });
  }
  if (!req.params.dataProducaoInicial) {
    res.status(400).json({
      description: "O parâmetro [dataProducaoInicial] deve ser preenchido!",
    });
  }
  if (
    String(req.params.dataProducaoInicial)
      .toLowerCase()
      .match(/^\d{4}[\-](0?[1-9]|1[012])[\-](0?[1-9]|[12][0-9]|3[01])$/)
  ) {
    res.status(400).json({
      description: `O parâmetro [dataProducaoInicial] possui um conteúdo inválido: ${req.params.dataProducao}!`,
    });
  }
  if (!req.params.dataProducaoFinal) {
    res.status(400).json({
      description: "O parâmetro [dataProducaoFinal] deve ser preenchido!",
    });
  }
  if (
    String(req.params.dataProducaoFinal)
      .toLowerCase()
      .match(/^\d{4}[\-](0?[1-9]|1[012])[\-](0?[1-9]|[12][0-9]|3[01])$/)
  ) {
    res.status(400).json({
      description: `O parâmetro [dataProducaoFinal] possui um conteúdo inválido: ${req.params.dataProducaoFinal}!`,
    });
  }

  const fazendeiro = String(req.params.fazendeiro);
  const dataProducaoInicial = new Date(req.params.dataProducaoInicial).toISOString();
  const dataProducaoFinal = new Date(req.params.dataProducaoFinal).toISOString();

  if (new Date(dataProducaoInicial).getTime > new Date(dataProducaoFinal).getTime) {
    res.status(400).json({
      description: "Período inválido: o valor do parâmetro [dataProducaoInicial] não pode ser maior que o valor do parâmetro [dataProducaoFinal]!",
    });
  }

  // TODO: verificar qual o valor retornado quando não existem registros que atandam a seleção.
  const producaoList = await Producao.find({
    fazendeiro: fazendeiro,
    dataProducao: { $gte: dataProducaoInicial, $lte: dataProducaoFinal },
  });

  res.status(200).json({
    description: "Dados das produções de leite obtidos com sucesso!",
    data: producaoList,
  });
});

const findProducoesByFazendeiroAndAnoAndMes = AssyncHandler(async (req, res) => {
  const producaoList = [];

  res.status(200).json({
    description: "Dados das produções de leite obtidos com sucesso!",
    data: producaoList,
  });
});

const findProducoesMensaisByFazendeiroAndAno = AssyncHandler(async (req, res) => {
  const producaoList = [];

  res.status(200).json({
    description: "Dados das produções de leite obtidos com sucesso!",
    data: producaoList,
  });
});

const findProducoesByParams = AssyncHandler(async (req, res) => {
});

module.exports = {
  createProducao,
  updateProducao,
  deleteProducao,
  findProducaoById,
  findProducoesByParams,
};
